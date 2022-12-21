import {
  createIntegrationEntity,
  Entity,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';
import { Entities } from '../../constants';
import { Role } from '../../types';
import { generateRoleKey } from '../../util/generateRoleKey';

export function createRoleEntity(role: Role): Entity {
  return createIntegrationEntity({
    entityData: {
      source: role,
      assign: {
        _key: generateRoleKey(role.name),
        _type: Entities.SNYK_ROLE._type,
        _class: Entities.SNYK_ROLE._class,
        name: role.name,
        description: role.description,
        publicId: role.publicId,
        createdOn: parseTimePropertyValue(role.created),
        modified: parseTimePropertyValue(role.modified),
      },
    },
  });
}
