import {
  IntegrationSpecConfig,
  RelationshipClass,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../../src/config';

export const invocationConfig: IntegrationSpecConfig<IntegrationConfig> = {
  integrationSteps: [
    {
      /**
       * ENDPOINT: N/A
       * PATTERN: Singleton
       */
      id: 'fetch-account',
      name: 'Fetch Account',
      entities: [
        {
          resourceName: 'Snyk Account',
          _type: 'snyk_account',
          _class: ['Account'],
        },
      ],
      relationships: [],
      implemented: true,
    },
    {
      /**
       * ENDPOINT: N/A
       * PATTERN: Singleton
       */
      id: 'fetch-service',
      name: 'Fetch Service',
      entities: [
        {
          resourceName: 'Snyk Service',
          _type: 'snyk_service',
          _class: ['Service'],
        },
      ],
      relationships: [
        {
          _type: 'snyk_account_has_service',
          sourceType: 'snyk_account',
          _class: RelationshipClass.HAS,
          targetType: 'snyk_service',
        },
      ],
      dependsOn: ['fetch-account'],
      implemented: true,
    },
    {
      /**
       * ENDPOINT: GET https://snyk.io/api/v1/org/{orgId}/projects
       * PATTERN: Fetch Entities
       */
      id: 'fetch-projects',
      name: 'Fetch Projects',
      entities: [
        {
          resourceName: 'Snyk Project',
          _type: 'snyk_project',
          _class: ['Project'],
        },
      ],
      relationships: [
        {
          _type: 'snyk_organization_has_project',
          sourceType: 'snyk_organization',
          _class: RelationshipClass.HAS,
          targetType: 'snyk_project',
        },
        {
          _class: RelationshipClass.SCANS,
          _type: 'snyk_service_scans_project',
          sourceType: 'snyk_service',
          targetType: 'snyk_project',
        },
      ],
      dependsOn: ['fetch-organizations', 'fetch-service'],
      implemented: true,
    },
    {
      /**
       * ENDPOINT: n/a
       * PATTERN: Build Child Relationships
       */
      id: 'build-project-repo-relationships',
      name: 'Build Project -> Repo Relationships',
      entities: [],
      relationships: [],
      mappedRelationships: [
        {
          _type: 'snyk_project_scans_code_repo',
          sourceType: 'snyk_project',
          _class: RelationshipClass.SCANS,
          targetType: 'code_repo',
          direction: RelationshipDirection.FORWARD,
        },
      ],
      dependsOn: ['fetch-projects'],
      implemented: false,
    },
    {
      /**
       * ENDPOINT: POST https://snyk.io/api/v1/org/{orgId}/project/{projectId}/aggregated-issues
       * PATTERN: Fetch Child Entities
       */
      id: 'fetch-project-issues',
      name: 'Fetch Project Issues',
      entities: [
        {
          resourceName: 'Snyk Issue',
          _type: 'snyk_issue',
          _class: ['Finding'],
        },
      ],
      relationships: [
        {
          _type: 'snyk_project_has_issue',
          sourceType: 'snyk_project',
          _class: RelationshipClass.HAS,
          targetType: 'snyk_issue',
        },
      ],
      dependsOn: ['fetch-projects'],
      implemented: false,
    },
    {
      /**
       * ENDPOINT: POST https://snyk.io/api/v1/org/{orgId}/project/{projectId}/aggregated-issues
       * PATTERN: Fetch Child Entities
       */
      id: 'fetch-group',
      name: 'Fetch Group',
      entities: [
        {
          resourceName: 'Snyk Group',
          _type: 'snyk_group',
          _class: ['Group'],
        },
      ],
      relationships: [
        {
          _class: RelationshipClass.HAS,
          _type: 'snyk_account_has_group',
          sourceType: 'snyk_account',
          targetType: 'snyk_group',
        },
      ],
      implemented: true,
    },
    {
      /**
       * ENDPOINT: POST https://snyk.io/api/v1/org/{orgId}/project/{projectId}/aggregated-issues
       * PATTERN: Fetch Child Entities
       */
      id: 'fetch-organizations',
      name: 'Fetch Organizations',
      entities: [
        {
          resourceName: 'Snyk Organization',
          _type: 'snyk_organization',
          _class: ['Organization'],
        },
      ],
      relationships: [],
      dependsOn: ['fetch-group'],
      implemented: true,
    },
    {
      /**
       * ENDPOINT: POST https://snyk.io/api/v1/org/{orgId}/project/{projectId}/aggregated-issues
       * PATTERN: Fetch Child Entities
       */
      id: 'fetch-roles',
      name: 'Fetch Group Roles',
      entities: [
        {
          resourceName: 'Snyk Role',
          _type: 'snyk_role',
          _class: ['AccessRole'],
        },
      ],
      relationships: [
        {
          _class: RelationshipClass.HAS,
          _type: 'snyk_group_has_role',
          sourceType: 'snyk_group',
          targetType: 'snyk_role',
        },
      ],
      dependsOn: ['fetch-group'],
      implemented: true,
    },
    {
      /**
       * ENDPOINT: n/a
       * PATTERN: Build Child Relationships
       */
      id: 'build-user-role-relationship',
      name: 'Build User and Role Relationship',
      entities: [
        {
          _class: ['AccessRole'],
          _type: 'snyk_role',
          resourceName: 'Snyk Role',
        },
      ],
      relationships: [
        {
          _class: RelationshipClass.ASSIGNED,
          _type: 'snyk_user_assigned_role',
          sourceType: 'snyk_user',
          targetType: 'snyk_role',
        },
        {
          _class: RelationshipClass.HAS,
          _type: 'snyk_organization_has_role',
          sourceType: 'snyk_organization',
          targetType: 'snyk_role',
        },
      ],
      dependsOn: ['fetch-users', 'fetch-organizations'],
      implemented: true,
    },
    {
      /**
       * ENDPOINT: n/a
       * PATTERN: Build Child Relationships
       */
      id: 'build-issue-cve-cwe-relationships',
      name: 'Build Issue -> CVE/CWE Relationships',
      entities: [],
      relationships: [],
      mappedRelationships: [
        {
          _type: 'snyk_issue_is_cve',
          sourceType: 'snyk_issue',
          _class: RelationshipClass.IS,
          targetType: 'cve',
          direction: RelationshipDirection.FORWARD,
        },
        {
          _type: 'snyk_issue_exploits_cwe',
          sourceType: 'snyk_issue',
          _class: RelationshipClass.EXPLOITS,
          targetType: 'cwe',
          direction: RelationshipDirection.FORWARD,
        },
      ],
      dependsOn: ['fetch-project-issues'],
      implemented: false,
    },
  ],
};
