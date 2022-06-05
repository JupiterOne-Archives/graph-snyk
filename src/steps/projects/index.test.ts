import {
  executeStepWithDependencies,
  Recording,
  setupRecording,
} from '@jupiterone/integration-sdk-testing';
import { buildStepTestConfigForStep } from '../../../test/config';
import { StepIds } from '../../constants';

let recording: Recording;
afterEach(async () => {
  await recording.stop();
});

test('fetch-projects', async () => {
  recording = setupRecording({
    directory: __dirname,
    name: 'fetch-projects',
  });

  const stepConfig = buildStepTestConfigForStep(StepIds.FETCH_PROJECTS);
  const stepResult = await executeStepWithDependencies(stepConfig);
  expect(stepResult).toMatchStepMetadata(stepConfig);
});
