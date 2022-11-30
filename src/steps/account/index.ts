import {
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../config';
import { Entities, SetDataKeys, StepIds } from '../../constants';
import { createServiceEntity } from '../findings/converters';
import { APIClient } from '../../snyk/client';

async function fetchAccount(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
) {
  const { instance, jobState, logger } = context;

  const apiClient = new APIClient(logger, instance.config);
  const currentOrgName = await apiClient.getCurrentOrgName();

  const serviceEntity = await jobState.addEntity(
    createServiceEntity(instance.config.snykOrgId, currentOrgName),
  );

  await jobState.setData(SetDataKeys.ACCOUNT_ENTITY, serviceEntity);
}

export const steps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: StepIds.FETCH_ACCOUNT,
    name: 'Fetch Account',
    entities: [Entities.SNYK_ACCOUNT],
    relationships: [],
    executionHandler: fetchAccount,
  },
];
