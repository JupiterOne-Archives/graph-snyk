import {
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';
import SnykClient from '@jupiterone/snyk-client';

import {
  createCVEEntity,
  createCWEEntity,
  createFindingEntity,
  createFindingVulnerabilityRelationship,
  createFindingWeaknessRelationship,
  createServiceEntity,
  createServiceFindingRelationship,
  Project,
  SnykVulnIssue,
} from '../converters';
import { FindingEntity, IntegrationConfig } from '../types';

const step: IntegrationStep<IntegrationConfig> = {
  id: 'fetch-findings',
  name: 'Fetch findings',
  types: [
    'cve',
    'cwe',
    'snyk_account',
    'snyk_finding',
    'snyk_finding_is_cve',
    'snyk_finding_exploits_cwe',
    'snyk_service_identified_snyk_finding',
  ],
  async executionHandler({
    jobState,
    instance,
    logger,
  }: IntegrationStepExecutionContext<IntegrationConfig>) {
    const config = instance.config;
    const snyk = new SnykClient(config.snykApiKey, config.snykOrgId);

    const findingEntities: { [key: string]: FindingEntity } = {};
    const cveEntities: { [cve: string]: Entity } = {};
    const cweEntities: { [cwe: string]: Entity } = {};

    const allProjects: Project[] = (
      await snyk.listAllProjects(config.snykOrgId)
    ).projects;

    logger.info(
      {
        projects: allProjects.length,
      },
      'Fetched projects',
    );

    const service = createServiceEntity(config.snykOrgId);
    await jobState.addEntity(service);

    for (const project of allProjects) {
      const name: string[] = project.name.split(':');
      const projectName = name[0];
      const packageName = name[1];

      const listIssuesRes = (
        await snyk.listIssues(config.snykOrgId, project.id, {})
      ).issues;

      logger.info(
        {
          project: {
            id: project.id,
          },
          vulnerabilities: listIssuesRes.vulnerabilities.length,
          licenses: listIssuesRes.licenses.length,
        },
        'Fetched project issues',
      );

      const vulnerabilities: SnykVulnIssue[] = listIssuesRes.vulnerabilities;
      vulnerabilities.forEach((vuln: SnykVulnIssue) => {
        vuln.type = 'vulnerability';
      });

      const licenses: SnykVulnIssue[] = listIssuesRes.licenses;
      licenses.forEach((license: SnykVulnIssue) => {
        license.type = 'license';
        license.identifiers = { CVE: [], CWE: [] };
      });

      const snykIssues: SnykVulnIssue[] = vulnerabilities.concat(licenses);
      for (const issue of snykIssues) {
        const finding = createFindingEntity(issue);
        if (findingEntities[finding.id]) {
          if (!findingEntities[finding.id].targets.includes(projectName)) {
            findingEntities[finding.id].targets.push(projectName);
          }
        } else {
          finding.targets.push(projectName);
          finding.identifiedInFile = packageName;
          findingEntities[finding.id] = finding;

          for (const cve of finding.cve) {
            let cveEntity = cveEntities[cve];
            if (!cveEntity) {
              cveEntity = createCVEEntity(cve, issue.cvssScore);
              cveEntities[cve] = cveEntity;
            }
            await jobState.addRelationship(
              createFindingVulnerabilityRelationship(finding, cveEntity),
            );
          }

          for (const cwe of finding.cwe) {
            let cweEntity = cweEntities[cwe];
            if (!cweEntity) {
              cweEntity = createCWEEntity(cwe);
              cweEntities[cwe] = cweEntity;
            }
            await jobState.addRelationship(
              createFindingWeaknessRelationship(finding, cweEntity),
            );
          }

          await jobState.addRelationship(
            createServiceFindingRelationship(service, finding),
          );
        }
      }
    }

    await jobState.addEntities(Object.values(cweEntities));
    await jobState.addEntities(Object.values(cveEntities));
    await jobState.addEntities(Object.values(findingEntities));
  },
};

export default step;
