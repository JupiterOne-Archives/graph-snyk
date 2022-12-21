import {
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk-core';
import { Entities } from '../../constants';
import { Account } from '../../types';

export function createAccountEntity(data: Account): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: `snyk:${data.id}`,
        _type: Entities.SNYK_ACCOUNT._type,
        _class: Entities.SNYK_ACCOUNT._class,
        id: data.id,
        description: data.description,
        name: data.name,
      },
    },
  });
}
