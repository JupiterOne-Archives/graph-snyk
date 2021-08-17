import {
  IntegrationLogger,
  IntegrationProviderAPIError,
  IntegrationProviderAuthenticationError,
} from '@jupiterone/integration-sdk-core';
import SnykClient from '@jupiterone/snyk-client';

import { Project, SnykVulnIssue } from './types';
import { IntegrationConfig } from './types';

interface ListProjectsResponse {
  org: {
    name: string;
    id: string;
  };
  projects: Project[];
}

interface ListIssuesResponse {
  ok: boolean;
  deprecated: string;
  issues: {
    vulnerabilities: SnykVulnIssue[];
    licenses: SnykVulnIssue[];
  };
  dependencyCount: number;
  packageManager: string;
}

export type ResourceIteratee<T> = (each: T) => Promise<void> | void;

/**
 * An APIClient maintains authentication state and provides an interface to
 * third party data APIs.
 *
 * It is recommended that integrations wrap provider data APIs to provide a
 * place to handle error responses and implement common patterns for iterating
 * resources.
 */
export class APIClient {
  private snyk: SnykClient;

  constructor(
    readonly logger: IntegrationLogger,
    readonly config: IntegrationConfig,
  ) {
    this.snyk = new SnykClient(config.snykApiKey);
  }

  public async verifyAuthentication(): Promise<void> {
    try {
      await this.snyk.verifyAccess(this.config.snykOrgId);
    } catch (err) {
      this.logger.error(
        {
          err,
        },
        'Error verifying authentication',
      );
      throw new IntegrationProviderAuthenticationError({
        cause: err,
        endpoint: `https://snyk.io/api/v1/org/${this.config.snykOrgId}/members`,
        status: err.response?.statusCode || err.statusCode || err.status,
        statusText:
          err.response?.statusMessage || err.statusText || err.message,
      });
    }
  }

  /**
   * @param iteratee receives each resource and produces entities/relationships
   */
  public async iterateProjects(
    iteratee: ResourceIteratee<Project>,
  ): Promise<void> {
    let response: ListProjectsResponse;
    try {
      response = await this.snyk.listAllProjects(this.config.snykOrgId);
    } catch (err) {
      this.logger.error(
        {
          err,
        },
        'Error listing projects',
      );
      throw new IntegrationProviderAPIError({
        cause: err,
        endpoint: 'listAllProjects',
        status: 'unknown',
        statusText: 'Unexpected error',
      });
    }

    const projects = response?.projects;
    if (projects && projects.length > 0) {
      this.logger.info(
        {
          projects: projects.length,
        },
        'Fetched projects',
      );
      for (const project of projects) {
        await iteratee(project);
      }
    } else {
      this.logger.info('No projects found');
    }
  }

  /**
   * @param iteratee receives each resource and produces entities/relationships
   */
  public async iterateIssues(
    project: Project,
    iteratee: ResourceIteratee<SnykVulnIssue>,
  ): Promise<void> {
    let response: ListIssuesResponse;
    try {
      response = await this.snyk.listIssues(
        this.config.snykOrgId,
        project.id,
        {},
      );
    } catch (err) {
      this.logger.error(
        {
          err,
          projectId: project.id,
        },
        'Error listing issues for project',
      );
      throw new IntegrationProviderAPIError({
        cause: err,
        endpoint: `listIssues project '${project.id}'`,
        status: 'unknown',
        statusText: 'Unexpected error',
      });
    }

    const issues = response?.issues;
    if (issues) {
      this.logger.info(
        {
          project: {
            id: project.id,
          },
          vulnerabilities: issues.vulnerabilities.length,
          licenses: issues.licenses.length,
        },
        'Fetched project issues',
      );

      for (const vuln of issues?.vulnerabilities) {
        vuln.type = 'vulnerability';
        await iteratee(vuln);
      }

      for (const license of issues?.licenses) {
        license.type = 'license';
        license.identifiers = { CVE: [], CWE: [] };
        await iteratee(license);
      }
    } else {
      this.logger.info({ project: { id: project.id } }, 'No issues found');
    }
  }
}

export function createAPIClient(
  logger: IntegrationLogger,
  config: IntegrationConfig,
): APIClient {
  return new APIClient(logger, config);
}
