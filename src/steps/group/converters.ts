import {
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk-core';
import { Entities } from '../../constants';
import { Group } from '../../types';

export function createGroupEntity(group: Group): Entity {
  return createIntegrationEntity({
    entityData: {
      source: group,
      assign: {
        _key: `snyk_group:${group.id}`,
        _type: Entities.SNYK_GROUP._type,
        _class: Entities.SNYK_GROUP._class,
        id: group.id,
        name: group.name,
        webLink: group.url,
      },
    },
  });
}
