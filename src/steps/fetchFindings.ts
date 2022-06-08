import {
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { APIClient } from '../snyk/client';
import { IntegrationConfig } from '../config';
import { Entities, Relationships, StepIds } from '../constants';
import {
  createCVEEntity,
  createCWEEntity,
  createFindingEntity,
  createFindingVulnerabilityRelationship,
  createFindingWeaknessRelationship,
  createServiceFindingRelationship,
} from '../converters';
import { CVEEntity, CWEEntity, FindingEntity } from '../types';
import { getAccountEntity } from '../util/entity';

type EntityCache = {
  findingEntities: { [key: string]: FindingEntity };
  cveEntities: { [cve: string]: CVEEntity };
  cweEntities: { [cwe: string]: CWEEntity };
};

async function fetchFindings({
  jobState,
  instance,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const serviceEntity = await getAccountEntity(jobState);
  const apiClient = new APIClient(logger, instance.config);

  const entityCache: EntityCache = {
    findingEntities: {},
    cveEntities: {},
    cweEntities: {},
  };

  await jobState.iterateEntities(
    {
      _type: Entities.PROJECT._type,
    },
    async (project) => {
      const projectId = project.id as string | undefined;
      const projectName = project.name as string | undefined;

      if (!projectId || !projectName) return;
      const [projectSourceName, packageName] = projectName.split(':');

      await apiClient.iterateIssues(projectId, async (issue) => {
        const finding = createFindingEntity(issue) as FindingEntity;

        if (entityCache.findingEntities[finding.id]) {
          if (
            !entityCache.findingEntities[finding.id].targets.includes(
              projectSourceName,
            )
          ) {
            entityCache.findingEntities[finding.id].targets.push(
              projectSourceName,
            );
          }
        } else {
          finding.targets.push(projectSourceName);
          finding.identifiedInFile = packageName;
          entityCache.findingEntities[finding.id] = finding;

          for (const cve of finding.cve || []) {
            let cveEntity = entityCache.cveEntities[cve];
            if (!cveEntity) {
              cveEntity = createCVEEntity(cve, issue.issueData.cvssScore!);
              entityCache.cveEntities[cve] = cveEntity;
            }
            await jobState.addRelationship(
              createFindingVulnerabilityRelationship(finding, cveEntity),
            );
          }

          for (const cwe of finding.cwe || []) {
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
    },
  );

  await jobState.addEntities(Object.values(entityCache.cweEntities));
  await jobState.addEntities(Object.values(entityCache.cveEntities));
  await jobState.addEntities(Object.values(entityCache.findingEntities));
}

export const steps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: StepIds.FETCH_FINDINGS,
    name: 'Fetch findings',
    entities: [Entities.CVE, Entities.CWE, Entities.SNYK_FINDING],
    relationships: [
      Relationships.FINDING_IS_CVE,
      Relationships.FINDING_EXPLOITS_CWE,
      Relationships.SERVICE_IDENTIFIED_FINDING,
    ],
    dependsOn: [StepIds.FETCH_ACCOUNT, StepIds.FETCH_PROJECTS],
    executionHandler: fetchFindings,
  },
];
