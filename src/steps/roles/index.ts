import {
  createDirectRelationship,
  Entity,
  getRawData,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../config';
import { Entities, Relationships, SetDataKeys, StepIds } from '../../constants';
import { createRoleEntity } from './converters';
import { APIClient } from '../../snyk/client';
import { User } from '../../types';

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
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  await jobState.iterateEntities(
    { _type: Entities.SNYK_USER._type },
    async (userEntity) => {
      const user = getRawData<User>(userEntity);
      if (!user) {
        logger.warn(
          { _key: userEntity._key },
          'Could not get raw data for user entity',
        );
        return;
      }

      const roleEntity = (await jobState.findEntity(
        `snyk_role:${user.role}`,
      )) as Entity;

      if (roleEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.ASSIGNED,
            from: userEntity,
            to: roleEntity,
          }),
        );
      }
    },
  );
}

async function buildUserRoleRelationship({
  jobState,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  await jobState.iterateEntities(
    { _type: Entities.SNYK_ORGANIZATION._type },
    async (orgEntity) => {
      await jobState.iterateEntities(
        { _type: Entities.SNYK_USER._type },
        async (userEntity) => {
          const user = getRawData<User>(userEntity);
          if (!user) {
            logger.warn(
              { _key: userEntity._key },
              'Could not get raw data for user entity',
            );
            return;
          }

          const userRole = user.role;
          if (userRole) {
            const roleEntity = await jobState.addEntity(
              createRoleEntity({ name: userRole }),
            );

            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.ASSIGNED,
                from: userEntity,
                to: roleEntity,
              }),
            );

            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.HAS,
                from: orgEntity,
                to: roleEntity,
              }),
            );
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
