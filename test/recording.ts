import {
  setupRecording,
  SetupRecordingInput,
} from '@jupiterone/integration-sdk-testing';

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

export { withRecording };
