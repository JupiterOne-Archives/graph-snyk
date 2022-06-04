import {
  createDirectRelationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { Entities, Relationships } from '../../constants';
import { APIClient } from '../../client';
import { StepIds } from '../../constants';
import { createProjectEntity } from './converter';
import { getAccountEntity } from '../../util/entity';
import { IntegrationConfig } from '../../config';

async function fetchProjects({
  jobState,
  instance,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const serviceEntity = await getAccountEntity(jobState);
  const apiClient = new APIClient(logger, instance.config);

  await apiClient.iterateProjects(async (project) => {
    const projectEntity = await jobState.addEntity(
      createProjectEntity(project),
    );

    await jobState.addRelationship(
      createDirectRelationship({
        from: serviceEntity,
        to: projectEntity,
        _class: RelationshipClass.HAS,
      }),
    );
  });
}

export const steps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: StepIds.FETCH_PROJECTS,
    name: 'Fetch Projects',
    entities: [Entities.PROJECT],
    relationships: [Relationships.ACCOUNT_PROJECT],
    dependsOn: [StepIds.FETCH_ACCOUNT],
    executionHandler: fetchProjects,
  },
];
