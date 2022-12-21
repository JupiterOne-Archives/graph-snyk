import {
  Entity,
  IntegrationInstanceConfig,
  IntegrationInvocationConfig,
  Relationship,
} from '@jupiterone/integration-sdk-core';
import {
  executeStepWithDependencies,
  setupRecording,
  SetupRecordingInput,
  StepTestConfig,
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
      matchRequestsBy: {
        url: {
          pathname: false,
        },
      },
      ...(recordingSetupOptions || {}),
    },
  });

  try {
    await cb();
  } finally {
    await recording.stop();
  }
}

type AfterStepCollectionExecutionParams = {
  stepConfig: StepTestConfig<
    IntegrationInvocationConfig<IntegrationInstanceConfig>,
    IntegrationInstanceConfig
  >;
  stepResult: {
    collectedEntities: Entity[];
    collectedRelationships: Relationship[];
    collectedData: {
      [key: string]: any;
    };
    encounteredTypes: string[];
  };
};

type CreateStepCollectionTestParams = WithRecordingParams & {
  stepId: string;
  afterExecute?: (params: AfterStepCollectionExecutionParams) => Promise<void>;
};

function isMappedRelationship(r: Relationship): boolean {
  return !!r._mapping;
}

function filterDirectRelationships(
  relationships: Relationship[],
): Relationship[] {
  return relationships.filter((r) => !isMappedRelationship(r));
}

function createStepCollectionTest({
  recordingName,
  directoryName,
  recordingSetupOptions,
  stepId,
  afterExecute,
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

        expect({
          ...stepResult,
          // HACK (austinkelleher): `@jupiterone/integration-sdk-testing`
          // does not currently support `toMatchStepMetadata` with mapped
          // relationships, which is causing tests to fail. We will add
          // support soon and remove this hack.
          collectedRelationships: filterDirectRelationships(
            stepResult.collectedRelationships,
          ),
        }).toMatchStepMetadata({
          ...stepConfig,
          invocationConfig: {
            ...stepConfig.invocationConfig,
            integrationSteps: stepConfig.invocationConfig.integrationSteps.map(
              (s) => {
                return {
                  ...s,
                  mappedRelationships: [],
                };
              },
            ),
          },
        });

        if (afterExecute) await afterExecute({ stepResult, stepConfig });
      },
    );
  };
}

export { withRecording, createStepCollectionTest };
