import {
  Entity,
  IntegrationError,
  JobState,
} from '@jupiterone/integration-sdk-core';
import { SetDataKeys } from '../constants';

export async function getAccountEntity(jobState: JobState): Promise<Entity> {
  const accountEntity = await jobState.getData<Entity>(
    SetDataKeys.ACCOUNT_ENTITY,
  );

  if (!accountEntity) {
    throw new IntegrationError({
      message: 'Could not find account entity in job state',
      code: 'ACCOUNT_ENTITY_NOT_FOUND',
      fatal: true,
    });
  }

  return accountEntity;
}
