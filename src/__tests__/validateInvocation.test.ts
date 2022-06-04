import { createMockExecutionContext } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig, validateInvocation } from '../config';
import mockSnykClient from './mockSnykClient';

jest.mock('@jupiterone/snyk-client', () => {
  return jest.fn().mockImplementation(() => mockSnykClient);
});

test('passes with valid config', async () => {
  const instanceConfig: IntegrationConfig = {
    snykApiKey: 'asdf',
    snykOrgId: 'asdfasdf',
  };
  const executionContext = createMockExecutionContext({
    instanceConfig,
  });

  await validateInvocation(executionContext);
});

test('throws when access is denied', async () => {
  const instanceConfig: IntegrationConfig = {
    snykApiKey: 'asdf',
    snykOrgId: 'asdfasdf',
  };
  const executionContext = createMockExecutionContext({
    instanceConfig,
  });

  mockSnykClient.verifyAccess.mockRejectedValue(
    new Error('verifyAccess failure of any kind'),
  );

  await expect(validateInvocation(executionContext)).rejects.toThrow(
    new RegExp(
      'https://snyk.io/api/v1/org/asdfasdf/members: undefined verifyAccess failure of any kind',
    ),
  );
});

test('missing snykApiKey', async () => {
  const instanceConfig: IntegrationConfig = {
    snykApiKey: '',
    snykOrgId: 'asdfasdf',
  };
  const executionContext = createMockExecutionContext({
    instanceConfig,
  });

  await expect(validateInvocation(executionContext)).rejects.toThrow(
    /snykApiKey/,
  );
});

test('missing snykOrkId', async () => {
  const instanceConfig: IntegrationConfig = {
    snykApiKey: 'asdf',
    snykOrgId: '',
  };
  const executionContext = createMockExecutionContext({
    instanceConfig,
  });

  await expect(validateInvocation(executionContext)).rejects.toThrow(
    /snykOrgId/,
  );
});

test('throws error if config not provided', async () => {
  const executionContext = createMockExecutionContext<IntegrationConfig>();

  await expect(validateInvocation(executionContext)).rejects.toThrow(
    'Config requires',
  );
});
