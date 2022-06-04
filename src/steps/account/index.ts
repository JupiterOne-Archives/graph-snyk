import {
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../config';
import { Entities, SetDataKeys, StepIds } from '../../constants';
import { createServiceEntity } from '../../converters';

async function fetchAccount(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
) {
  const { instance, jobState } = context;
  const serviceEntity = await jobState.addEntity(
    createServiceEntity(instance.config.snykOrgId),
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
