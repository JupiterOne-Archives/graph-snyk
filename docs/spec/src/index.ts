import {
  IntegrationSpecConfig,
  RelationshipClass,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../../src/types';

export const invocationConfig: IntegrationSpecConfig<IntegrationConfig> = {
  integrationSteps: [
    {
      /**
       * ENDPOINT: GET https://snyk.io/api/v1/org/{orgId}/settings
       * PATTERN: Singleton
       */
      id: 'fetch-organization',
      name: 'Fetch Organization',
      entities: [
        {
          resourceName: 'Snyk Organization',
          _type: 'snyk_organization',
          _class: 'Account',
        },
      ],
      relationships: [],
      dependsOn: [],
      implemented: false,
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
          _class: 'Project',
        },
      ],
      relationships: [
        {
          _type: 'snyk_organization_has_project',
          sourceType: 'snyk_organization',
          _class: RelationshipClass.HAS,
          targetType: 'snyk_project',
        },
      ],
      dependsOn: ['fetch-organization'],
      implemented: false,
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
          _class: 'Finding',
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
