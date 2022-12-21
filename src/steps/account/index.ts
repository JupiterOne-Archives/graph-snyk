import {
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../config';
import { Entities, SetDataKeys, StepIds } from '../../constants';
import { createAccountEntity } from './converters';
import { Account } from '../../types';

async function fetchAccount({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const { name, description, id } = instance;

  const account: Account = {
    name,
    description,
    id,
  };

  const accountEntity = await jobState.addEntity(createAccountEntity(account));
  await jobState.setData(SetDataKeys.ACCOUNT_ENTITY, accountEntity);
}

export const accountStep: IntegrationStep<IntegrationConfig>[] = [
  {
    id: StepIds.FETCH_ACCOUNT,
    name: 'Fetch Account',
    entities: [Entities.SNYK_ACCOUNT],
    relationships: [],
    executionHandler: fetchAccount,
  },
];
