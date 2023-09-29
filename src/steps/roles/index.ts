import {
  createDirectRelationship,
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../config';
import { Entities, Relationships, SetDataKeys, StepIds } from '../../constants';
import { createRoleEntity } from './converters';
import { APIClient } from '../../snyk/client';
import { generateRoleKey } from '../../util/generateRoleKey';

async function fetchRoles({
  instance,
  jobState,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = new APIClient(logger, instance.config);
  const groupEntity = (await jobState.getData(
    SetDataKeys.GROUP_ENTITY,
  )) as Entity;

  await apiClient.iterateRoles(async (role) => {
    const roleEntity = await jobState.addEntity(createRoleEntity(role));

    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        from: groupEntity,
        to: roleEntity,
      }),
    );
  });
}

async function buildUserGroupRoleRelationship({
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  await jobState.iterateEntities(
    { _type: Entities.SNYK_USER._type },
    async (userEntity) => {
      if (!userEntity.role || typeof userEntity.role !== 'string') {
        return;
      }
      const roleEntityKey = generateRoleKey(userEntity.role);

      if (jobState.hasKey(roleEntityKey)) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.ASSIGNED,
            fromKey: userEntity._key,
            fromType: Entities.SNYK_USER._type,
            toKey: roleEntityKey,
            toType: Entities.SNYK_ROLE._type,
          }),
        );
      }
    },
  );
}

async function buildUserRoleRelationship({
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  await jobState.iterateEntities(
    { _type: Entities.SNYK_ORGANIZATION._type },
    async (orgEntity) => {
      await jobState.iterateEntities(
        { _type: Entities.SNYK_USER._type },
        async (userEntity) => {
          if (!userEntity.role || typeof userEntity.role !== 'string') {
            return;
          }

          const userRole = userEntity.role;
          if (userRole) {
            const roleEntity = createRoleEntity({ name: userRole });
            if (!jobState.hasKey(roleEntity._key)) {
              await jobState.addEntity(roleEntity);
            }

            const userRoleRelationship = createDirectRelationship({
              _class: RelationshipClass.ASSIGNED,
              from: userEntity,
              to: roleEntity,
            });
            if (!jobState.hasKey(userRoleRelationship._key)) {
              await jobState.addRelationship(userRoleRelationship);
            }

            const orgRoleRelationships = createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: orgEntity,
              to: roleEntity,
            });
            if (!jobState.hasKey(orgRoleRelationships._key)) {
              await jobState.addRelationship(orgRoleRelationships);
            }
          }
        },
      );
    },
  );
}

export const roleStep: IntegrationStep<IntegrationConfig>[] = [
  {
    id: StepIds.FETCH_GROUP_ROLES,
    name: 'Fetch Group Roles',
    entities: [Entities.SNYK_ROLE],
    relationships: [Relationships.GROUP_ROLE],
    dependsOn: [StepIds.FETCH_GROUP],
    executionHandler: fetchRoles,
  },
  {
    id: StepIds.BUILD_USER_GROUP_ROLE,
    name: 'Build User and Group Role Relationship',
    entities: [],
    relationships: [Relationships.USER_ROLE],
    dependsOn: [StepIds.FETCH_GROUP_ROLES, StepIds.FETCH_USERS],
    executionHandler: buildUserGroupRoleRelationship,
  },
  {
    id: StepIds.BUILD_USER_ROLE,
    name: 'Build User and Role Relationship',
    entities: [Entities.SNYK_ROLE],
    relationships: [Relationships.USER_ROLE, Relationships.ORGANIZATION_ROLE],
    dependsOn: [StepIds.FETCH_USERS, StepIds.FETCH_ORGANIZATIONS],
    executionHandler: buildUserRoleRelationship,
  },
];
