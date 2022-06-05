import {
  executeStepWithDependencies,
  setupRecording,
  SetupRecordingInput,
} from '@jupiterone/integration-sdk-testing';
import { buildStepTestConfigForStep } from './config';

type WithRecordingParams = {
  recordingName: string;
  directoryName: string;
  recordingSetupOptions?: SetupRecordingInput['options'];
};

async function withRecording(
  { recordingName, directoryName, recordingSetupOptions }: WithRecordingParams,
  cb: () => Promise<void>,
) {
  const recording = setupRecording({
    directory: directoryName,
    name: recordingName,
    options: {
      ...(recordingSetupOptions || {}),
    },
  });

  try {
    await cb();
  } finally {
    await recording.stop();
  }
}

type CreateStepCollectionTestParams = WithRecordingParams & {
  stepId: string;
};

function createStepCollectionTest({
  recordingName,
  directoryName,
  recordingSetupOptions,
  stepId,
}: CreateStepCollectionTestParams) {
  return async () => {
    await withRecording(
      {
        directoryName,
        recordingName,
        recordingSetupOptions,
      },
      async () => {
        const stepConfig = buildStepTestConfigForStep(stepId);
        const stepResult = await executeStepWithDependencies(stepConfig);
        expect(stepResult).toMatchStepMetadata(stepConfig);
      },
    );
  };
}

export { withRecording, createStepCollectionTest };
