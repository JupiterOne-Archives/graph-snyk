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
  snykOrgId: string;
  snykApiKey: string;
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

  if (!config?.snykOrgId || !config?.snykApiKey) {
    throw new IntegrationValidationError(
      'Config requires all of {snykOrgId, snykApiKey}',
    );
  }

  const apiClient = new APIClient(context.logger, config);
  await apiClient.verifyAuthentication();
}

export { instanceConfigFields, IntegrationConfig, validateInvocation };
