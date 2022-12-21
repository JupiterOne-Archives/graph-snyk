import {
  RelationshipClass,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';

export const SetDataKeys = {
  ACCOUNT_ENTITY: 'ACCOUNT_ENTITY',
  GROUP_ENTITY: 'GROUP_ENTITY',
  SERVICE_ENTITY: 'SERVICE_ENTITY',
};

export const StepIds = {
  FETCH_ACCOUNT: 'fetch-account',
  FETCH_SERVICE: 'fetch-service',
  FETCH_GROUP: 'fetch-group',
  BUILD_GROUP_ORG: 'build-group-organization',
  BUILD_ACCOUNT_ORG: 'build-account-organization',
  FETCH_ORGANIZATIONS: 'fetch-organizations',
  FETCH_GROUP_ROLES: 'fetch-roles',
  BUILD_USER_GROUP_ROLE: 'build-user-group-role-relationship',
  BUILD_USER_ROLE: 'build-user-role-relationship',
  FETCH_PROJECTS: 'fetch-projects',
  FETCH_FINDINGS: 'fetch-findings',
  FETCH_USERS: 'fetch-users',
};

export const Entities = {
  CVE: {
    _type: 'cve',
    _class: ['Vulnerability'],
    resourceName: 'CVE',
  },
  CWE: {
    _type: 'cwe',
    _class: ['Weakness'],
    resourceName: 'CWE',
  },
  SNYK_ACCOUNT: {
    _type: 'snyk_account',
    _class: ['Account'],
    resourceName: 'Snyk Account',
  },
  SNYK_SERVICE: {
    _type: 'snyk_service',
    _class: ['Service'],
    resourceName: 'Snyk Service',
  },
  SNYK_FINDING: {
    _type: 'snyk_finding',
    _class: ['Finding'],
    resourceName: 'Snyk Issue',
  },
  SNYK_PROJECT: {
    _type: 'snyk_project',
    _class: ['Project'],
    resourceName: 'Snyk Project',
  },
  SNYK_USER: {
    _type: 'snyk_user',
    _class: ['User'],
    resourceName: 'Snyk User',
  },
  SNYK_ROLE: {
    _type: 'snyk_role',
    _class: ['AccessRole'],
    resourceName: 'Snyk Role',
  },
  SNYK_GROUP: {
    _type: 'snyk_group',
    _class: ['Group'],
    resourceName: 'Snyk Group',
  },
  SNYK_ORGANIZATION: {
    _type: 'snyk_organization',
    _class: ['Organization'],
    resourceName: 'Snyk Organization',
  },
};

export const Relationships = {
  SERVICE_IDENTIFIED_FINDING: {
    _type: 'snyk_service_identified_finding',
    sourceType: Entities.SNYK_SERVICE._type,
    _class: RelationshipClass.IDENTIFIED,
    targetType: Entities.SNYK_FINDING._type,
  },
  ACCOUNT_SERVICE: {
    _type: 'snyk_account_has_service',
    sourceType: Entities.SNYK_ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.SNYK_SERVICE._type,
  },
  SERVICE_PROJECT: {
    _type: 'snyk_service_scans_project',
    sourceType: Entities.SNYK_SERVICE._type,
    _class: RelationshipClass.SCANS,
    targetType: Entities.SNYK_PROJECT._type,
  },
  ACCOUNT_GROUP: {
    _type: 'snyk_account_has_group',
    sourceType: Entities.SNYK_ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.SNYK_GROUP._type,
  },
  ACCOUNT_ORG: {
    _type: 'snyk_account_has_organization',
    sourceType: Entities.SNYK_ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.SNYK_ORGANIZATION._type,
  },
  ACCOUNT_USER: {
    _type: 'snyk_account_has_user',
    sourceType: Entities.SNYK_ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.SNYK_USER._type,
  },
  PROJECT_FINDING: {
    _type: 'snyk_project_has_finding',
    sourceType: Entities.SNYK_PROJECT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.SNYK_FINDING._type,
  },
  GROUP_ORGANIZATION: {
    _type: 'snyk_group_has_organization',
    sourceType: Entities.SNYK_GROUP._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.SNYK_ORGANIZATION._type,
  },
  GROUP_ROLE: {
    _type: 'snyk_group_has_role',
    sourceType: Entities.SNYK_GROUP._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.SNYK_ROLE._type,
  },
  USER_ROLE: {
    _type: 'snyk_user_assigned_role',
    sourceType: Entities.SNYK_USER._type,
    _class: RelationshipClass.ASSIGNED,
    targetType: Entities.SNYK_ROLE._type,
  },
  ORGANIZATION_USER: {
    _type: 'snyk_organization_has_user',
    sourceType: Entities.SNYK_ORGANIZATION._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.SNYK_USER._type,
  },
  ORGANIZATION_ROLE: {
    _type: 'snyk_organization_has_role',
    sourceType: Entities.SNYK_ORGANIZATION._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.SNYK_ROLE._type,
  },
  ORGANIZATION_PROJECT: {
    _type: 'snyk_organization_has_project',
    sourceType: Entities.SNYK_ORGANIZATION._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.SNYK_PROJECT._type,
  },
  ORGANIZATION_IDENTIFIED_FINDING: {
    _type: 'snyk_organizaton_identified_snyk_finding',
    sourceType: Entities.SNYK_ORGANIZATION._type,
    _class: RelationshipClass.IDENTIFIED,
    targetType: Entities.SNYK_FINDING._type,
  },
};

export const mappedRelationships = {
  PROJECT_REPO: {
    _type: 'snyk_project_scans_coderepo',
    sourceType: Entities.SNYK_PROJECT._type,
    _class: RelationshipClass.SCANS,
    targetType: 'CodeRepo',
    direction: RelationshipDirection.FORWARD,
  },
  FINDING_IS_CVE: {
    _type: 'snyk_finding_is_cve',
    sourceType: Entities.SNYK_FINDING._type,
    _class: RelationshipClass.IS,
    targetType: Entities.CVE._type,
    direction: RelationshipDirection.FORWARD,
  },
  FINDING_EXPLOITS_CWE: {
    _type: 'snyk_finding_exploits_cwe',
    sourceType: Entities.SNYK_FINDING._type,
    _class: RelationshipClass.EXPLOITS,
    targetType: Entities.CWE._type,
    direction: RelationshipDirection.FORWARD,
  },
};
