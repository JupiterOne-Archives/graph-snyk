import {
  createDirectRelationship,
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../config';
import { Entities, Relationships, SetDataKeys, StepIds } from '../../constants';
import { createGroupEntity } from './converters';
import { APIClient } from '../../snyk/client';

async function fetchGroup({
  instance,
  jobState,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = new APIClient(logger, instance.config);
  const accountEntity = (await jobState.getData(
    SetDataKeys.ACCOUNT_ENTITY,
  )) as Entity;

  const groupEntity = instance.config.snykGroupId
    ? await jobState.addEntity(
        createGroupEntity(await apiClient.getGroupDetails()),
      )
    : undefined;

  await jobState.setData(SetDataKeys.GROUP_ENTITY, groupEntity);

  if (groupEntity)
    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        from: accountEntity,
        to: groupEntity,
      }),
    );
}

export const groupStep: IntegrationStep<IntegrationConfig>[] = [
  {
    id: StepIds.FETCH_GROUP,
    name: 'Fetch Group',
    entities: [Entities.SNYK_GROUP],
    relationships: [Relationships.ACCOUNT_GROUP],
    dependsOn: [StepIds.FETCH_ACCOUNT],
    executionHandler: fetchGroup,
  },
];
