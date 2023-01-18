import { createStepCollectionTest } from '../../../test/recording';
import { StepIds } from '../../constants';

test(
  'fetch-organizations',
  createStepCollectionTest({
    directoryName: __dirname,
    recordingName: 'fetch-organizations',
    stepId: StepIds.FETCH_ORGANIZATIONS,
  }),
);
