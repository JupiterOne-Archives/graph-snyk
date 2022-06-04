import {
  IntegrationLogger,
  IntegrationProviderAPIError,
  IntegrationProviderAuthenticationError,
} from '@jupiterone/integration-sdk-core';
import SnykClient from '@jupiterone/snyk-client';
import { IntegrationConfig } from './config';
import { AggregatedIssue, Project } from './types';

interface ListProjectsResponse {
  org: {
    name: string;
    id: string;
  };
  projects: Project[];
}

interface ListAggregatedIssuesResponse {
  issues: AggregatedIssue[];
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
      this.logger.info(
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
    projectId: string,
    iteratee: ResourceIteratee<AggregatedIssue>,
  ): Promise<void> {
    let response: ListAggregatedIssuesResponse;
    try {
      response = await this.snyk.listAggregatedIssues(
        this.config.snykOrgId,
        projectId,
        {},
      );
    } catch (err) {
      this.logger.error(
        {
          err,
          projectId,
        },
        'Error listing aggregated issues for project',
      );
      throw new IntegrationProviderAPIError({
        cause: err,
        endpoint: `listAggregatedIssues project '${projectId}'`,
        status: 'unknown',
        statusText: 'Unexpected error',
      });
    }

    if (response?.issues) {
      this.logger.info(
        {
          projectId,
          issues: response.issues.length,
        },
        'Fetched project issues',
      );

      for (const issue of response.issues) {
        await iteratee(issue);
      }
    } else {
      this.logger.info({ projectId }, 'No issues found');
    }
  }
}

export function createAPIClient(
  logger: IntegrationLogger,
  config: IntegrationConfig,
): APIClient {
  return new APIClient(logger, config);
}
