import { createStepCollectionTest } from '../../../test/recording';
import { StepIds } from '../../constants';

test(
  'fetch-findings',
  createStepCollectionTest({
    directoryName: __dirname,
    recordingName: 'fetch-findings',
    stepId: StepIds.FETCH_FINDINGS,
  }),
);
