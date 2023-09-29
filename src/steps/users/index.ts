import {
  createDirectRelationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { Entities, Relationships } from '../../constants';
import { APIClient } from '../../snyk/client';
import { StepIds } from '../../constants';
import { IntegrationConfig } from '../../config';
import { createUserEntity } from './converter';

async function fetchUsers({
  jobState,
  instance,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = new APIClient(logger, instance.config);

  await jobState.iterateEntities(
    { _type: Entities.SNYK_ORGANIZATION._type },
    async (organizationEntity) => {
      if (!organizationEntity.id || typeof organizationEntity.id !== 'string') {
        return;
      }

      await apiClient.iterateUsers(organizationEntity.id, async (user) => {
        const userEntity = createUserEntity(user);
        if (!jobState.hasKey(userEntity._key)) {
          await jobState.addEntity(userEntity);
        }

        await jobState.addRelationship(
          createDirectRelationship({
            from: organizationEntity,
            to: userEntity,
            _class: RelationshipClass.HAS,
          }),
        );
      });
    },
  );
}

export const steps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: StepIds.FETCH_USERS,
    name: 'Fetch Organization Members',
    entities: [Entities.SNYK_USER],
    relationships: [Relationships.ORGANIZATION_USER],
    dependsOn: [StepIds.FETCH_ORGANIZATIONS],
    executionHandler: fetchUsers,
  },
];
