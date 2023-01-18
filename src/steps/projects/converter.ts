import {
  createIntegrationEntity,
  createMappedRelationship,
  Entity,
  parseTimePropertyValue,
  RelationshipClass,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import { Entities, mappedRelationships } from '../../constants';
import { isSupportedCodeRepoOrigin, parseSnykProjectName } from './codeRepo';

export function createProjectEntity(orgId: string, project: any) {
  const {
    repoOrganization,
    repoName,
    repoFullName,
    fullDirectoryPath,
    topLevelDirectoryName,
    fileName,
  } = parseSnykProjectName(project.name);

  return createIntegrationEntity({
    entityData: {
      source: { ...project, orgId },
      assign: {
        _class: Entities.SNYK_PROJECT._class,
        _type: Entities.SNYK_PROJECT._type,
        _key: project.id as string,

        name: project.name,
        repoFullName,
        repoOrganization,
        repoName,
        directoryName: topLevelDirectoryName,
        topLevelDirectoryName,
        fullDirectoryPath,
        fileName,

        displayName: project.name as string,
        // Example origins: cli, github, github-enterprise, gitlab
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

        environmentAttributes: project.attributes?.environment,
      },
    },
  });
}

export function buildProjectRepoMappedRelationship(projectEntity: Entity) {
  const projectOrigin = projectEntity.origin as string | undefined;
  const projectName = projectEntity.name as string | undefined;

  if (
    !projectName ||
    !projectOrigin ||
    !isSupportedCodeRepoOrigin(projectOrigin)
  )
    return;

  const { repoOrganization, repoName } = parseSnykProjectName(projectName);
  if (!repoName || !repoOrganization) return;

  return createMappedRelationship({
    _class: RelationshipClass.SCANS,
    _type: mappedRelationships.PROJECT_REPO._type,
    _mapping: {
      relationshipDirection: RelationshipDirection.FORWARD,
      sourceEntityKey: projectEntity._key,
      targetFilterKeys: [['_class', 'name', 'owner']],
      targetEntity: {
        _class: 'CodeRepo',
        name: repoName,
        owner: repoOrganization,
      },
      skipTargetCreation: true,
    },
  });
}
