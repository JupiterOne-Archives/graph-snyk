import SnykClient from "./snyk-client";

import {
  IntegrationInstanceAuthenticationError,
  IntegrationInstanceConfigError,
  IntegrationValidationContext,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { SnykIntegrationInstanceConfig } from "./types";

export default async function invocationValidator(
  context: IntegrationValidationContext,
) {
  const config = context.instance.config as SnykIntegrationInstanceConfig;

  if (!config) {
    throw new IntegrationInstanceConfigError("Missing configuration");
  } else if (!config.SnykApiKey) {
    throw new IntegrationInstanceConfigError("snykApiKey is required");
  } else if (!config.SnykOrgId) {
    throw new IntegrationInstanceConfigError("snykOrgId is required");
  }

  const provider = new SnykClient(config.SnykApiKey, config.SnykOrgId);
  try {
    await provider.verifyAccess();
  } catch (err) {
    throw new IntegrationInstanceAuthenticationError(err);
  }
}
