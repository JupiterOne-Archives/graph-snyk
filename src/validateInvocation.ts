import {
  IntegrationExecutionContext,
  IntegrationProviderAuthenticationError,
  IntegrationValidationError,
} from '@jupiterone/integration-sdk-core';
import SnykClient from '@jupiterone/snyk-client';

import { IntegrationConfig } from './types';

export default async function validateInvocation(
  context: IntegrationExecutionContext<IntegrationConfig>,
) {
  const { config } = context.instance;

  if (!config?.snykOrgId || !config?.snykApiKey) {
    throw new IntegrationValidationError(
      'Config requires all of {snykOrgId, snykApiKey}',
    );
  }

  const apiClient = new SnykClient(config.snykApiKey);

  try {
    await apiClient.verifyAccess(config.snykOrgId);
  } catch (err) {
    throw new IntegrationProviderAuthenticationError({
      cause: err,
      endpoint: `https://snyk.io/api/v1/org/${config.snykOrgId}/members`,
      status: err.response?.statusCode || err.statusCode || err.status,
      statusText: err.response?.statusMessage || err.statusText || err.message,
    });
  }
}
