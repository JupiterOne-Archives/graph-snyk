import {
  createDirectRelationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { APIClient } from '../../snyk/client';
import { IntegrationConfig } from '../../config';
import { Entities, Relationships, StepIds } from '../../constants';
import {
  createCVEEntity,
  createCWEEntity,
  createFindingEntity,
  createFindingVulnerabilityRelationship,
  createFindingWeaknessRelationship,
  createServiceFindingRelationship,
} from './converters';
import { FindingEntity } from '../../types';
import { getAccountEntity } from '../../util/entity';

async function fetchFindings({
  jobState,
  instance,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const serviceEntity = await getAccountEntity(jobState);
  const apiClient = new APIClient(logger, instance.config);

  let totalFindingsEncountered = 0;
  let totalCriticalFindingsEncountered = 0;
  let totalHighFindingsEncountered = 0;
  let totalMediumFindingsEncountered = 0;
  let totalLowFindingsEncountered = 0;

  await jobState.iterateEntities(
    {
      _type: Entities.PROJECT._type,
    },
    async (project) => {
      const projectId = project.id as string | undefined;
      const projectName = project.name as string | undefined;

      if (!projectId || !projectName) return;
      const [, packageName] = projectName.split(':');

      await apiClient.iterateIssues(projectId, async (issue) => {
        const finding = createFindingEntity(
          {
            ...issue,
            projectId,
          },
          project,
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

        await jobState.addRelationship(
          createServiceFindingRelationship(serviceEntity, finding),
        );

        await jobState.addEntity(finding);

        const projectHasFindingRelationship = createDirectRelationship({
          from: project,
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
    entities: [Entities.CVE, Entities.CWE, Entities.SNYK_FINDING],
    relationships: [
      Relationships.FINDING_IS_CVE,
      Relationships.FINDING_EXPLOITS_CWE,
      Relationships.SERVICE_IDENTIFIED_FINDING,
      Relationships.PROJECT_FINDING,
    ],
    dependsOn: [StepIds.FETCH_ACCOUNT, StepIds.FETCH_PROJECTS],
    executionHandler: fetchFindings,
  },
];
