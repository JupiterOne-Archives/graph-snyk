import { createStepCollectionTest } from '../../../test/recording';
import { StepIds } from '../../constants';

test(
  'fetch-users',
  createStepCollectionTest({
    directoryName: __dirname,
    recordingName: 'fetch-users',
    stepId: StepIds.FETCH_USERS,
  }),
);
