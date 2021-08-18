import {
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { APIClient } from '../client';
import { Entities, Relationships } from '../constants';
import {
  createCVEEntity,
  createCWEEntity,
  createFindingEntity,
  createFindingVulnerabilityRelationship,
  createFindingWeaknessRelationship,
  createServiceEntity,
  createServiceFindingRelationship,
} from '../converters';
import { CVEEntity, CWEEntity, FindingEntity, IntegrationConfig } from '../types';

type EntityCache = {
  findingEntities: { [key: string]: FindingEntity };
  cveEntities: { [cve: string]: CVEEntity };
  cweEntities: { [cwe: string]: CWEEntity };
};

const step: IntegrationStep<IntegrationConfig> = {
  id: 'fetch-findings',
  name: 'Fetch findings',
  entities: [
    Entities.CVE,
    Entities.CWE,
    Entities.SNYK_ACCOUNT,
    Entities.SNYK_FINDING,
  ],
  relationships: [
    Relationships.FINDING_IS_CVE,
    Relationships.FINDING_EXPLOITS_CWE,
    Relationships.SERVICE_IDENTIFIED_FINDING,
  ],
  async executionHandler({
    jobState,
    instance,
    logger,
  }: IntegrationStepExecutionContext<IntegrationConfig>) {
    const orgId = instance.config.snykOrgId;
    const apiClient = new APIClient(logger, instance.config);

    const entityCache: EntityCache = {
      findingEntities: {},
      cveEntities: {},
      cweEntities: {},
    };

    const serviceEntity = createServiceEntity(orgId);

    await apiClient.iterateProjects(async (project) => {
      const [projectName, packageName] = project.name.split(':');

      await apiClient.iterateIssues(project, async (issue) => {
        const finding = createFindingEntity(issue);
        if (entityCache.findingEntities[finding.id]) {
          if (
            !entityCache.findingEntities[finding.id].targets.includes(
              projectName,
            )
          ) {
            entityCache.findingEntities[finding.id].targets.push(projectName);
          }
        } else {
          finding.targets.push(projectName);
          finding.identifiedInFile = packageName;
          entityCache.findingEntities[finding.id] = finding;

          for (const cve of finding.cve) {
            let cveEntity = entityCache.cveEntities[cve];
            if (!cveEntity) {
              cveEntity = createCVEEntity(cve, issue.cvssScore);
              entityCache.cveEntities[cve] = cveEntity;
            }
            await jobState.addRelationship(
              createFindingVulnerabilityRelationship(finding, cveEntity),
            );
          }

          for (const cwe of finding.cwe) {
            let cweEntity = entityCache.cweEntities[cwe];
            if (!cweEntity) {
              cweEntity = createCWEEntity(cwe);
              entityCache.cweEntities[cwe] = cweEntity;
            }
            await jobState.addRelationship(
              createFindingWeaknessRelationship(finding, cweEntity),
            );
          }

          await jobState.addRelationship(
            createServiceFindingRelationship(serviceEntity, finding),
          );
        }
      });
    });

    await jobState.addEntity(serviceEntity);
    await jobState.addEntities(Object.values(entityCache.cweEntities));
    await jobState.addEntities(Object.values(entityCache.cveEntities));
    await jobState.addEntities(Object.values(entityCache.findingEntities));
  },
};

export default step;
