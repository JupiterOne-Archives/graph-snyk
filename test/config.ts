import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';
import { StepTestConfig } from '@jupiterone/integration-sdk-testing';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { invocationConfig } from '../src';
import { IntegrationConfig } from '../src/config';

if (process.env.LOAD_ENV) {
  dotenv.config({
    path: path.join(__dirname, '../.env'),
  });
}
const DEFAULT_SNYK_ORG_ID = '0b2bc034-5fca-4a90-b3de-c04fa86b47ef';
const DEFAULT_SNYK_API_KEY = 'dummy-api-key';

export const integrationConfig: IntegrationConfig = {
  snykOrgId: process.env.SNYK_ORG_ID || DEFAULT_SNYK_ORG_ID,
  snykApiKey: process.env.SNYK_API_KEY || DEFAULT_SNYK_API_KEY,
};

export function buildStepTestConfigForStep(stepId: string): StepTestConfig {
  return {
    stepId,
    instanceConfig: integrationConfig,
    invocationConfig: invocationConfig as IntegrationInvocationConfig,
  };
}
