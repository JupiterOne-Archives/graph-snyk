import {
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';
import SnykClient from '@jupiterone/snyk-client';

import {
  createCVEEntities,
  createCWEEntities,
  createFindingEntity,
  createFindingVulnerabilityRelationship,
  createFindingWeaknessRelationship,
  createServiceEntity,
  createServiceFindingRelationship,
  Project,
  SnykVulnIssue,
} from '../converters';
import { FindingEntity, IntegrationConfig } from '../types';

type FindingsMap = {
  [key: string]: FindingEntity;
};

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
    const findingsById: FindingsMap = {};

    const snyk = new SnykClient(config.snykApiKey, config.snykOrgId);
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
        if (findingsById[finding.id]) {
          if (!findingsById[finding.id].targets.includes(projectName)) {
            findingsById[finding.id].targets.push(projectName);
          }
        } else {
          finding.targets.push(projectName);
          finding.identifiedInFile = packageName;
          findingsById[finding.id] = finding;

          const cveList = createCVEEntities(finding);
          for (const cve of cveList) {
            await jobState.addEntity(cve);
            await jobState.addRelationship(
              createFindingVulnerabilityRelationship(finding, cve),
            );
          }

          const cweList = createCWEEntities(finding);
          for (const cwe of cweList) {
            await jobState.addEntity(cwe);
            await jobState.addRelationship(
              createFindingWeaknessRelationship(finding, cwe),
            );
          }

          await jobState.addRelationship(
            createServiceFindingRelationship(service, finding),
          );
        }
      }
    }

    await jobState.addEntities(Object.values(findingsById));
  },
};

export default step;
