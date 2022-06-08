import {
  createDirectRelationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { Entities, Relationships } from '../../constants';
import { APIClient } from '../../snyk/client';
import { StepIds } from '../../constants';
import { getAccountEntity } from '../../util/entity';
import { IntegrationConfig } from '../../config';
import { createUserEntity } from './converter';

async function fetchUsers({
  jobState,
  instance,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const serviceEntity = await getAccountEntity(jobState);
  const apiClient = new APIClient(logger, instance.config);

  await apiClient.iterateUsers(async (user) => {
    const userEntity = await jobState.addEntity(createUserEntity(user));

    await jobState.addRelationship(
      createDirectRelationship({
        from: serviceEntity,
        to: userEntity,
        _class: RelationshipClass.HAS,
      }),
    );
  });
}

export const steps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: StepIds.FETCH_USERS,
    name: 'Fetch Organization Members',
    entities: [Entities.USER],
    relationships: [Relationships.ACCOUNT_USER],
    dependsOn: [StepIds.FETCH_ACCOUNT],
    executionHandler: fetchUsers,
  },
];
