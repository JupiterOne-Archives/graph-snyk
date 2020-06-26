import {
  IntegrationExecutionContext,
  IntegrationValidationError,
} from '@jupiterone/integration-sdk-core';

import { APIClient } from './client';
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

  const apiClient = new APIClient(context.logger, config);
  await apiClient.verifyAuthentication();
}
