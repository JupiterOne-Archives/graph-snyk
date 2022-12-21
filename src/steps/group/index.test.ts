import { createStepCollectionTest } from '../../../test/recording';
import { StepIds } from '../../constants';

test(
  'fetch-group',
  createStepCollectionTest({
    directoryName: __dirname,
    recordingName: 'fetch-group',
    stepId: StepIds.FETCH_GROUP,
  }),
);
