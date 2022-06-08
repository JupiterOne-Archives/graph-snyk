import {
  createDirectRelationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { Entities, mappedRelationships, Relationships } from '../../constants';
import { APIClient } from '../../snyk/client';
import { StepIds } from '../../constants';
import {
  buildProjectRepoMappedRelationship,
  createProjectEntity,
} from './converter';
import { getAccountEntity } from '../../util/entity';
import { IntegrationConfig } from '../../config';

async function fetchProjects({
  jobState,
  instance,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const serviceEntity = await getAccountEntity(jobState);
  const apiClient = new APIClient(logger, instance.config);
  let numProjectsCollected = 0;

  await apiClient.iterateProjects(async (project) => {
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
      createProjectEntity(project),
    );

    numProjectsCollected++;

    await jobState.addRelationship(
      createDirectRelationship({
        from: serviceEntity,
        to: projectEntity,
        _class: RelationshipClass.HAS,
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
}

export const steps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: StepIds.FETCH_PROJECTS,
    name: 'Fetch Projects',
    entities: [Entities.PROJECT],
    relationships: [Relationships.ACCOUNT_PROJECT],
    mappedRelationships: [mappedRelationships.PROJECT_REPO],
    dependsOn: [StepIds.FETCH_ACCOUNT],
    executionHandler: fetchProjects,
  },
];
