import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';

import {
  IntegrationConfig,
  instanceConfigFields,
  validateInvocation,
} from './config';
import { steps as projectSteps } from './steps/projects';
import { steps as findingSteps } from './steps/findings';
import { steps as userSteps } from './steps/users';
import { groupStep } from './steps/group';
import { organizationStep } from './steps/organization';
import { roleStep } from './steps/roles';
import { accountStep } from './steps/account';
import { serviceStep } from './steps/service';
import getStepStartStates from './getStepStartStates';

export const invocationConfig: IntegrationInvocationConfig<IntegrationConfig> = {
  instanceConfigFields,
  validateInvocation,
  getStepStartStates,
  integrationSteps: [
    ...accountStep,
    ...serviceStep,
    ...projectSteps,
    ...findingSteps,
    ...userSteps,
    ...groupStep,
    ...organizationStep,
    ...roleStep,
  ],
};
