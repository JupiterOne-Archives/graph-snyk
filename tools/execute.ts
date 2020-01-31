/* tslint:disable:no-console */
import { executeIntegrationLocal } from "@jupiterone/jupiter-managed-integration-sdk";
import { stepFunctionsInvocationConfig } from "../src/index";

const integrationConfig = {
  snykApiKey: process.env.SNYK_LOCAL_EXECUTION_API_KEY,
  snykOrgId: process.env.SNYK_LOCAL_EXECUTION_ORG_ID,
};

const invocationArgs = {
  // providerPrivateKey: process.env.PROVIDER_LOCAL_EXECUTION_PRIVATE_KEY
};

executeIntegrationLocal(
  integrationConfig,
  stepFunctionsInvocationConfig,
  invocationArgs,
).catch(err => {
  console.error(err);
  process.exit(1);
});
