import { APIClient } from './snyk/client';

import {
  IntegrationInstanceConfig,
  IntegrationInstanceConfigFieldMap,
  IntegrationExecutionContext,
  IntegrationValidationError,
} from '@jupiterone/integration-sdk-core';

/**
 * Properties provided by the `IntegrationInstance.config`. This reflects the
 * same properties defined by `instanceConfigFields`.
 */
interface IntegrationConfig extends IntegrationInstanceConfig {
  snykApiKey: string;
  snykOrgId?: string;
  snykGroupId?: string;
}

const instanceConfigFields: IntegrationInstanceConfigFieldMap<IntegrationConfig> = {
  snykOrgId: {
    type: 'string',
  },
  snykGroupId: {
    type: 'string',
  },
  snykApiKey: {
    type: 'string',
    mask: true,
  },
};

export default async function validateInvocation(
  context: IntegrationExecutionContext<IntegrationConfig>,
) {
  const { config } = context.instance;

  const errMessages: string[] = [];
  if (!config?.snykApiKey) {
    errMessages.push('Config requires {snykApiKey}.');
  }
  if (!config?.snykOrgId && !config?.snykGroupId) {
    errMessages.push('Config requires either {snykOrgId} or {snykGroupId}.');
  }

  if (errMessages.length) {
    throw new IntegrationValidationError(errMessages.join(' '));
  }

  const apiClient = new APIClient(context.logger, config);
  await apiClient.verifyAuthentication();
}

export { instanceConfigFields, IntegrationConfig, validateInvocation };
