import {
  createDirectRelationship,
  Entity,
  getRawData,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import {
  Entities,
  mappedRelationships,
  Relationships,
  SetDataKeys,
} from '../../constants';
import { APIClient } from '../../snyk/client';
import { StepIds } from '../../constants';
import {
  buildProjectRepoMappedRelationship,
  createProjectEntity,
} from './converter';
import { IntegrationConfig } from '../../config';
import { Organization } from '../../types';

async function fetchProjects({
  jobState,
  instance,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = new APIClient(logger, instance.config);
  const serviceEntity = (await jobState.getData(
    SetDataKeys.SERVICE_ENTITY,
  )) as Entity;
  let numProjectsCollected = 0;

  await jobState.iterateEntities(
    { _type: Entities.SNYK_ORGANIZATION._type },
    async (organizationEntity) => {
      const organization = getRawData<Organization>(organizationEntity);

      if (!organization) {
        logger.warn(
          { _key: organizationEntity._key },
          'Could not get raw data for organization entity',
        );
        return;
      }

      await apiClient.iterateProjects(organization.id, async (project) => {
        // TODO (austinkelleher, INT-4063) - Remove this later after we've collected some
        // information on real world origins
        if (project.origin !== 'github') {
          logger.info(
            {
              projectId: project.id,
              origin: project.origin,
            },
            'Found origin that is not GitHub',
          );
        }

        const projectEntity = await jobState.addEntity(
          createProjectEntity(organization.id, project),
        );

        numProjectsCollected++;

        await jobState.addRelationship(
          createDirectRelationship({
            from: organizationEntity,
            to: projectEntity,
            _class: RelationshipClass.HAS,
          }),
        );

        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.SCANS,
            from: serviceEntity,
            to: projectEntity,
          }),
        );

        const projectRepoMappedRelationship = buildProjectRepoMappedRelationship(
          projectEntity,
        );

        if (projectRepoMappedRelationship) {
          await jobState.addRelationship(projectRepoMappedRelationship);
        }
      });

      if (numProjectsCollected) {
        logger.info(
          {
            numProjectsCollected,
          },
          'Collected Snyk projects',
        );
      }
    },
  );
}

export const steps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: StepIds.FETCH_PROJECTS,
    name: 'Fetch Projects',
    entities: [Entities.SNYK_PROJECT],
    relationships: [
      Relationships.ORGANIZATION_PROJECT,
      Relationships.SERVICE_PROJECT,
    ],
    mappedRelationships: [mappedRelationships.PROJECT_REPO],
    dependsOn: [StepIds.FETCH_ORGANIZATIONS, StepIds.FETCH_SERVICE],
    executionHandler: fetchProjects,
  },
];
