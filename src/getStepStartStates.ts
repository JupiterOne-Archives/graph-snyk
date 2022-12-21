import {
  IntegrationExecutionContext,
  StepStartStates,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from './config';
import { StepIds } from './constants';

export default async function getStepStartStates(
  context: IntegrationExecutionContext<IntegrationConfig>,
): Promise<StepStartStates> {
  const isEnterprise = !!context.instance.config.snykGroupId;

  return Promise.resolve({
    [StepIds.FETCH_GROUP]: { disabled: false },
    [StepIds.FETCH_ACCOUNT]: { disabled: false },
    [StepIds.FETCH_SERVICE]: { disabled: false },
    [StepIds.BUILD_USER_GROUP_ROLE]: { disabled: false },
    [StepIds.FETCH_PROJECTS]: { disabled: false },
    [StepIds.FETCH_FINDINGS]: { disabled: false },
    [StepIds.FETCH_USERS]: { disabled: false },
    [StepIds.FETCH_ORGANIZATIONS]: { disabled: false },

    [StepIds.BUILD_GROUP_ORG]: { disabled: !isEnterprise },
    [StepIds.FETCH_GROUP_ROLES]: { disabled: !isEnterprise },

    [StepIds.BUILD_ACCOUNT_ORG]: { disabled: isEnterprise },
    [StepIds.BUILD_USER_ROLE]: { disabled: isEnterprise },
  });
}
