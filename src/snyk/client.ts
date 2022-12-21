import {
  IntegrationLogger,
  IntegrationProviderAPIError,
  IntegrationProviderAuthenticationError,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../config';
import { AggregatedIssue, Organization, Project, Role } from '../types';
import { retry } from '@lifeomic/attempt';
import fetch, { BodyInit, RequestInit } from 'node-fetch';

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

const SNYK_API_BASE = 'https://snyk.io/api/v1/';
const DEFAULT_API_REQUEST_TIMEOUT = 30000;

/**
 * An APIClient maintains authentication state and provides an interface to
 * third party data APIs.
 *
 * It is recommended that integrations wrap provider data APIs to provide a
 * place to handle error responses and implement common patterns for iterating
 * resources.
 */
export class APIClient {
  private readonly apiKey: string;
  private readonly retries: number = 5;

  constructor(
    readonly logger: IntegrationLogger,
    readonly config: IntegrationConfig,
  ) {
    if (!config.snykApiKey) {
      throw new Error('API key must be defined');
    }

    this.apiKey = config.snykApiKey;
  }

  public async verifyAuthentication(): Promise<void> {
    try {
      await this.snykRequest({
        method: 'GET',
        uri: `org/${this.config.snykOrgId}/members`,
      });
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

  getCurrentUserDetails() {
    return this.snykRequestWithRetry({
      method: 'GET',
      uri: `user/me`,
    });
  }

  async getCurrentOrgName(): Promise<string | undefined> {
    try {
      const currentUserDetails = await this.getCurrentUserDetails();

      return (currentUserDetails.orgs || []).find((org) => {
        return org && org.id === this.config.snykOrgId;
      })?.name;
    } catch (err) {
      this.logger.warn({ err }, 'Could not fetch current org name');
      return undefined;
    }
  }

  /**
   * @param iteratee receives each resource and produces entities/relationships
   */
  public async iterateProjects(
    organizationId: string,
    iteratee: ResourceIteratee<Project>,
  ): Promise<void> {
    let response: ListProjectsResponse;
    try {
      response = await this.listAllProjects(organizationId);
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
      response = await this.listAggregatedIssues(
        this.config.snykOrgId,
        projectId,
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

  /**
   * Snyk API wrapper
   * Will throw an error if one returned by Snyk
   * @param args - Arguments to the request function
   * @returns {Object} response - API response object
   */
  async snykRequest({
    uri,
    method,
    body,
  }: {
    uri: string;
    method: string;
    body?: BodyInit;
  }) {
    const options: RequestInit = {
      method,
      timeout: DEFAULT_API_REQUEST_TIMEOUT,
      body,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `token ${this.apiKey}`,
      },
    };

    const apiRequestUrl = SNYK_API_BASE + uri;
    const response = await fetch(apiRequestUrl, options);

    const result = await response.json();

    if (result.error) {
      throw new IntegrationProviderAPIError({
        endpoint: apiRequestUrl,
        status: response.status,
        statusText: response.statusText,
        code: result.code,
        message: result.message,
        fatal: false,
      });
    }

    return result;
  }

  async snykRequestWithRetry({
    uri,
    method,
    body,
  }: {
    uri: string;
    method: string;
    body?: BodyInit;
  }) {
    return retry(() => this.snykRequest({ uri, method, body }), {
      delay: 5000,
      factor: 1.2,
      maxAttempts: this.retries,
      handleError(err, context) {
        const code = err.statusCode;
        if (code < 500 && code !== 429) {
          context.abort();
        }
      },
    });
  }

  /**
   * "List All The Projects in the Organization"
   * @param {string} orgId - Organization ID
   * @returns {Object} orgs - object representing the organization
   * @returns {Object} projects - object representing the list of projects
   */
  async listAllProjects(orgId) {
    return this.snykRequestWithRetry({
      method: 'GET',
      uri: `org/${orgId}/projects`,
    });
  }

  /**
   * "List All Aggregated Issues"
   * @param {string} orgId - Organization ID
   * @param {string} projectId - Project ID
   * @param {Object} filters - Object with filters
   * @returns {Object} object representing the list of issues
   */
  async listAggregatedIssues(orgId, projectId) {
    return this.snykRequestWithRetry({
      method: 'POST',
      uri: `/org/${orgId}/project/${projectId}/aggregated-issues`,
    });
  }

  async iterateUsers(
    organizationId: string,
    iteratee: (user: any) => Promise<void>,
  ) {
    const users = await this.snykRequestWithRetry({
      method: 'GET',
      uri: `org/${organizationId}/members?includeGroupAdmins=true`,
    });

    for (const user of users) {
      await iteratee(user);
    }
  }

  async iterateOrganizations(iteratee: ResourceIteratee<Organization>) {
    const response = await this.snykRequestWithRetry({
      method: 'GET',
      uri: `group/${this.config.snykGroupId}/orgs`,
    });

    for (const org of response.orgs) {
      await iteratee(org);
    }
  }

  async iterateRoles(iteratee: ResourceIteratee<Role>) {
    const roles = await this.snykRequestWithRetry({
      method: 'GET',
      uri: `group/${this.config.snykGroupId}/roles`,
    });

    for (const role of roles) {
      await iteratee(role);
    }
  }

  async getGroupDetails() {
    const { orgs, ...rest } = await this.snykRequestWithRetry({
      method: 'GET',
      uri: `group/${this.config.snykGroupId}/orgs`,
    });

    return rest;
  }
}
