import {
  createIntegrationEntity,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';
import { Entities } from '../../constants';

export function createProjectEntity(project: any) {
  return createIntegrationEntity({
    entityData: {
      source: project,
      assign: {
        _class: Entities.PROJECT._class,
        _type: Entities.PROJECT._type,
        _key: project.id as string,
        name: project.name,
        displayName: project.name as string,
        origin: project.origin,
        type: project.type,
        readOnly: project.readOnly,
        testFrequency: project.testFrequency,
        monitored: project.isMonitored === true,
        totalDependencies: project.totalDependencies,

        issueCountLow: project.issueCountsBySeverity?.low,
        issueCountMedium: project.issueCountsBySeverity?.medium,
        issueCountHigh: project.issueCountsBySeverity?.high,
        issueCountCritical: project.issueCountsBySeverity?.high,

        imageId: project.imageId,
        imageTag: project.imageTag,
        imageBaseImage: project.imageBaseImage,
        imagePlatform: project.imagePlatform,
        imageCluster: project.imageCluster,

        // TODO (austinkelleher): Consider adding `importingUser` data + relationships
        // TODO (austinkelleher): Consider adding `tags` array values

        branch: project.branch,
        lastScannedOn: parseTimePropertyValue(project.lastTestedDate),
        createdOn: parseTimePropertyValue(project.created),
        webLink: project.browseUrl,
      },
    },
  });
}
