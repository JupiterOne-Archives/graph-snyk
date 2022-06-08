import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';

import {
  IntegrationConfig,
  instanceConfigFields,
  validateInvocation,
} from './config';
import { steps as accountSteps } from './steps/account';
import { steps as projectSteps } from './steps/projects';
import { steps as findingSteps } from './steps/fetchFindings';
import { steps as userSteps } from './steps/users';

export const invocationConfig: IntegrationInvocationConfig<IntegrationConfig> = {
  instanceConfigFields,
  validateInvocation,
  integrationSteps: [
    ...accountSteps,
    ...projectSteps,
    ...findingSteps,
    ...userSteps,
  ],
};
