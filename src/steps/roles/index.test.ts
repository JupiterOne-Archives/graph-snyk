import { createStepCollectionTest } from '../../../test/recording';
import { StepIds } from '../../constants';

test(
  'fetch-roles',
  createStepCollectionTest({
    directoryName: __dirname,
    recordingName: 'fetch-roles',
    stepId: StepIds.FETCH_GROUP_ROLES,
  }),
);

test(
  'build-user-role-relationship',
  createStepCollectionTest({
    directoryName: __dirname,
    recordingName: 'build-user-role-relationship',
    stepId: StepIds.BUILD_USER_GROUP_ROLE,
  }),
);
