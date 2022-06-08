import { createStepCollectionTest } from '../../../test/recording';
import { mappedRelationships, StepIds } from '../../constants';

test(
  'fetch-projects',
  createStepCollectionTest({
    directoryName: __dirname,
    recordingName: 'fetch-projects',
    stepId: StepIds.FETCH_PROJECTS,
    async afterExecute({ stepResult }) {
      // NOTE: This is temporary. Once `toMatchStepMetadata` supports mapped
      // relationships, then this can be removed.
      const collectedMappedRelationships = stepResult.collectedRelationships.filter(
        (r) => {
          return (
            r._type === mappedRelationships.PROJECT_REPO._type &&
            r._class === mappedRelationships.PROJECT_REPO._class
          );
        },
      );

      expect(collectedMappedRelationships.length).toBeGreaterThan(0);
      return Promise.resolve();
    },
  }),
);
