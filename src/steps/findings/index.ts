import {
  createDirectRelationship,
  Entity,
  getRawData,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { APIClient } from '../../snyk/client';
import { IntegrationConfig } from '../../config';
import {
  Entities,
  mappedRelationships,
  Relationships,
  SetDataKeys,
  StepIds,
} from '../../constants';
import {
  createCVEEntity,
  createCWEEntity,
  createFindingEntity,
  createFindingVulnerabilityRelationship,
  createFindingWeaknessRelationship,
} from './converters';
import { FindingEntity, Project } from '../../types';

async function fetchFindings({
  jobState,
  instance,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = new APIClient(logger, instance.config);
  const serviceEntity = (await jobState.getData(
    SetDataKeys.SERVICE_ENTITY,
  )) as Entity;

  let totalFindingsEncountered = 0;
  let totalCriticalFindingsEncountered = 0;
  let totalHighFindingsEncountered = 0;
  let totalMediumFindingsEncountered = 0;
  let totalLowFindingsEncountered = 0;

  await jobState.iterateEntities(
    {
      _type: Entities.SNYK_PROJECT._type,
    },
    async (projectEntity) => {
      const projectId = projectEntity.id as string | undefined;
      const projectName = projectEntity.name as string | undefined;

      const project = getRawData<Project & { orgId: string }>(projectEntity);
      if (!project) {
        logger.warn(
          { _key: projectEntity._key },
          'Could not get raw data for project entity',
        );
        return;
      }

      if (!projectId || !projectName) return;
      const [, packageName] = projectName.split(':');

      await apiClient.iterateIssues(projectId, async (issue) => {
        const finding = createFindingEntity(
          {
            ...issue,
            projectId,
          },
          projectEntity,
        ) as FindingEntity;

        totalFindingsEncountered++;

        if (finding.severity === 'critical') {
          totalCriticalFindingsEncountered++;
        } else if (finding.severity === 'high') {
          totalHighFindingsEncountered++;
        } else if (finding.severity === 'medium') {
          totalMediumFindingsEncountered++;
        } else if (finding.severity === 'low') {
          totalLowFindingsEncountered++;
        }

        finding.identifiedInFile = packageName;

        for (const cve of finding.cve || []) {
          const cveEntity = createCVEEntity(cve, finding.score);
          await jobState.addRelationship(
            createFindingVulnerabilityRelationship(finding, cveEntity),
          );
        }

        for (const cwe of finding.cwe || []) {
          const cweEntity = createCWEEntity(cwe);
          await jobState.addRelationship(
            createFindingWeaknessRelationship(finding, cweEntity),
          );
        }

        await jobState.addEntity(finding);

        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.IDENTIFIED,
            from: serviceEntity,
            to: finding,
          }),
        );

        const projectHasFindingRelationship = createDirectRelationship({
          from: projectEntity,
          to: finding,
          _class: RelationshipClass.HAS,
        });

        if (!jobState.hasKey(projectHasFindingRelationship._key)) {
          await jobState.addRelationship(projectHasFindingRelationship);
        }
      });
    },
  );

  logger.info(
    {
      totalFindingsEncountered,
      totalCriticalFindingsEncountered,
      totalHighFindingsEncountered,
      totalMediumFindingsEncountered,
      totalLowFindingsEncountered,
    },
    'Finding Entity Counts Summary',
  );
}

export const steps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: StepIds.FETCH_FINDINGS,
    name: 'Fetch findings',
    entities: [Entities.SNYK_FINDING],
    relationships: [
      Relationships.PROJECT_FINDING,
      Relationships.SERVICE_IDENTIFIED_FINDING,
    ],
    mappedRelationships: [
      mappedRelationships.FINDING_IS_CVE,
      mappedRelationships.FINDING_EXPLOITS_CWE,
    ],
    dependsOn: [
      StepIds.FETCH_ORGANIZATIONS,
      StepIds.FETCH_PROJECTS,
      StepIds.FETCH_SERVICE,
    ],
    executionHandler: fetchFindings,
  },
];
