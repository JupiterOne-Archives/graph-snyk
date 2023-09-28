import { IntegrationProviderAuthenticationError } from '@jupiterone/integration-sdk-core';
import { createMockExecutionContext } from '@jupiterone/integration-sdk-testing';
import { integrationConfig } from '../test/config';
import { withRecording } from '../test/recording';
import validateInvocation, { IntegrationConfig } from './config';

describe('validateInvocation', () => {
  test('passes with valid config', async () => {
    await withRecording(
      {
        directoryName: __dirname,
        recordingName: 'validateInvocationPasses',
      },
      async () => {
        await validateInvocation(
          createMockExecutionContext<IntegrationConfig>({
            instanceConfig: integrationConfig,
          }),
        );
      },
    );
  });

  test('throws when invalid credentials supplied', async () => {
    expect.assertions(2);

    await withRecording(
      {
        directoryName: __dirname,
        recordingName: 'validateInvocationFailsInvalidCredentials',
        recordingSetupOptions: {
          recordFailedRequests: true,
        },
      },
      async () => {
        try {
          await validateInvocation(
            createMockExecutionContext<IntegrationConfig>({
              instanceConfig: {
                ...integrationConfig,
                snykApiKey: 'dummy-api-key',
              },
            }),
          );
        } catch (err) {
          expect(err instanceof IntegrationProviderAuthenticationError).toEqual(
            true,
          );
          expect(err.status).toEqual(401);
        }
      },
    );
  });

  test('should fallback to `snykGroupId` if `snykOrgId` is missing from integration config', async () => {
    await withRecording(
      {
        directoryName: __dirname,
        recordingName: 'validateInvocationPassesWithMissingOrgId',
      },
      async () => {
        await validateInvocation(
          createMockExecutionContext<IntegrationConfig>({
            instanceConfig: {
              ...integrationConfig,
              snykOrgId: undefined,
            },
          }),
        );
      },
    );
  });
});
