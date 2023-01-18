import {
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk-core';
import { Entities } from '../../constants';
import { Service } from '../../types';

export function createServiceEntity(service: Service): Entity {
  return createIntegrationEntity({
    entityData: {
      source: service,
      assign: {
        _key: `snyk_service`,
        _type: Entities.SNYK_SERVICE._type,
        _class: Entities.SNYK_SERVICE._class,
        category: ['security'],
        name: service.name,
        displayName: service.name,
        function: ['scanning'],
      },
    },
  });
}
