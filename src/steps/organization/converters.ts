import {
  createIntegrationEntity,
  Entity,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';
import { Entities } from '../../constants';
import { Organization } from '../../types';

export function createOrganizationEntity(org: Organization): Entity {
  return createIntegrationEntity({
    entityData: {
      source: org,
      assign: {
        _key: `snyk_org:${org.id}`,
        _type: Entities.SNYK_ORGANIZATION._type,
        _class: Entities.SNYK_ORGANIZATION._class,
        id: org.id,
        name: org.name,
        webLink: org.url,
        displayName: org.slug,
        createdOn: parseTimePropertyValue(org.created),
      },
    },
  });
}
