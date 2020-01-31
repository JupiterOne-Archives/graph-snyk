import { IntegrationInvocationConfig } from "@jupiterone/jupiter-managed-integration-sdk";

import executionHandler from "./executionHandler";
import invocationValidator from "./invocationValidator";

export const stepFunctionsInvocationConfig: IntegrationInvocationConfig = {
  invocationValidator,
  integrationStepPhases: [
    {
      steps: [
        {
          id: "synchronize",
          name: "Synchronize",
          executionHandler,
        },
      ],
    },
  ],
};
