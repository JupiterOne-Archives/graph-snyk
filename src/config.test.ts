import {
  IntegrationProviderAuthenticationError,
  IntegrationValidationError,
} from '@jupiterone/integration-sdk-core';
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

  test('should throw if `snykOrgId` missing from integration config', async () => {
    expect.assertions(1);

    try {
      await validateInvocation(
        createMockExecutionContext<IntegrationConfig>({
          instanceConfig: {
            snykOrgId: (undefined as unknown) as string,
            snykApiKey: 'dummy-api-key',
            snykGroupId: 'dummy-api-key',
          },
        }),
      );
    } catch (err) {
      expect(err instanceof IntegrationValidationError).toEqual(true);
    }
  });

  test('should throw if `snykOrgId` missing from integration config', async () => {
    expect.assertions(1);

    try {
      await validateInvocation(
        createMockExecutionContext<IntegrationConfig>({
          instanceConfig: {
            snykOrgId: 'dummy-org-id',
            snykApiKey: (undefined as unknown) as string,
            snykGroupId: 'dummy-org-id',
          },
        }),
      );
    } catch (err) {
      expect(err instanceof IntegrationValidationError).toEqual(true);
    }
  });
});
