import {
  createDirectRelationship,
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../config';
import { Entities, Relationships, SetDataKeys, StepIds } from '../../constants';
import { Service } from '../../types';
import { createServiceEntity } from './converters';

async function fetchService({
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const accountEntity = (await jobState.getData(
    SetDataKeys.ACCOUNT_ENTITY,
  )) as Entity;
  const service: Service = {
    name: 'Snyk Service',
  };

  const serviceEntity = await jobState.addEntity(createServiceEntity(service));
  await jobState.setData(SetDataKeys.SERVICE_ENTITY, serviceEntity);

  await jobState.addRelationship(
    createDirectRelationship({
      _class: RelationshipClass.HAS,
      from: accountEntity,
      to: serviceEntity,
    }),
  );
}

export const serviceStep: IntegrationStep<IntegrationConfig>[] = [
  {
    id: StepIds.FETCH_SERVICE,
    name: 'Fetch Service',
    entities: [Entities.SNYK_SERVICE],
    relationships: [Relationships.ACCOUNT_SERVICE],
    dependsOn: [StepIds.FETCH_ACCOUNT],
    executionHandler: fetchService,
  },
];
