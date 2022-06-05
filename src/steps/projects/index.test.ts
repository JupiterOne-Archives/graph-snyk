import { executeStepWithDependencies } from '@jupiterone/integration-sdk-testing';
import { buildStepTestConfigForStep } from '../../../test/config';
import { withRecording } from '../../../test/recording';
import { StepIds } from '../../constants';

test('fetch-projects', async () => {
  await withRecording(
    {
      directoryName: __dirname,
      recordingName: 'fetch-projects',
    },
    async () => {
      const stepConfig = buildStepTestConfigForStep(StepIds.FETCH_PROJECTS);
      const stepResult = await executeStepWithDependencies(stepConfig);
      expect(stepResult).toMatchStepMetadata(stepConfig);
    },
  );
});
