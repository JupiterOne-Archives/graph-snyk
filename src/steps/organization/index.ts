import {
  createDirectRelationship,
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../config';
import { Entities, Relationships, SetDataKeys, StepIds } from '../../constants';
import { createOrganizationEntity } from './converters';
import { APIClient } from '../../snyk/client';

async function fetchOrganizations({
  jobState,
  instance,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const client = new APIClient(logger, instance.config);
  const groupEntity = (await jobState.getData(
    SetDataKeys.GROUP_ENTITY,
  )) as Entity;

  if (groupEntity) {
    await client.iterateOrganizations(async (org) => {
      await jobState.addEntity(createOrganizationEntity(org));
    });
  } else {
    const userDetails = await client.getCurrentUserDetails();
    await jobState.addEntity(createOrganizationEntity(userDetails.orgs[0]));
  }
}

async function buildGroupOrganizationsRelationship({
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const groupEntity = (await jobState.getData(
    SetDataKeys.GROUP_ENTITY,
  )) as Entity;

  await jobState.iterateEntities(
    { _type: Entities.SNYK_ORGANIZATION._type },
    async (organizationEntity) => {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: groupEntity,
          to: organizationEntity,
        }),
      );
    },
  );
}

async function buildAccountOrganizationsRelationship({
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const accountEntity = (await jobState.getData(
    SetDataKeys.ACCOUNT_ENTITY,
  )) as Entity;

  await jobState.iterateEntities(
    { _type: Entities.SNYK_ORGANIZATION._type },
    async (organizationEntity) => {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: accountEntity,
          to: organizationEntity,
        }),
      );
    },
  );
}

export const organizationStep: IntegrationStep<IntegrationConfig>[] = [
  {
    id: StepIds.FETCH_ORGANIZATIONS,
    name: 'Fetch Organizations',
    entities: [Entities.SNYK_ORGANIZATION],
    relationships: [],
    dependsOn: [StepIds.FETCH_GROUP],
    executionHandler: fetchOrganizations,
  },
  {
    id: StepIds.BUILD_GROUP_ORG,
    name: 'Build Group and Organizations Relationship',
    entities: [],
    relationships: [Relationships.GROUP_ORGANIZATION],
    dependsOn: [StepIds.FETCH_GROUP, StepIds.FETCH_ORGANIZATIONS],
    executionHandler: buildGroupOrganizationsRelationship,
  },
  {
    id: StepIds.BUILD_ACCOUNT_ORG,
    name: 'Build Account and Organizations Relationship',
    entities: [],
    relationships: [Relationships.ACCOUNT_ORG],
    dependsOn: [StepIds.FETCH_ACCOUNT, StepIds.FETCH_ORGANIZATIONS],
    executionHandler: buildAccountOrganizationsRelationship,
  },
];
