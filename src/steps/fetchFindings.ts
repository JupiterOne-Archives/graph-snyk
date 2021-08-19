import {
  createMappedRelationship,
  Entity,
  getRawData,
  IntegrationError,
  IntegrationStep,
  IntegrationStepExecutionContext,
  JobState,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { APIClient } from '../client';
import {
  Entities,
  MappedRelationships,
  Relationships,
  SetDataKeys,
  StepIds,
  TargetEntities,
} from '../constants';
import {
  createFindingEntity,
  createServiceEntity,
  createServiceFindingRelationship,
} from '../converters';
import { AggregatedIssue, FindingEntity, IntegrationConfig } from '../types';

const CVE_URL_BASE = 'https://nvd.nist.gov/vuln/detail/';

type EntityCache = {
  findingEntities: { [key: string]: FindingEntity };
};

export async function getAccountEntity(jobState: JobState): Promise<Entity> {
  const accountEntity = await jobState.getData<Entity>(
    SetDataKeys.ACCOUNT_ENTITY,
  );

  if (!accountEntity) {
    throw new IntegrationError({
      message: 'Could not find account entity in job state',
      code: 'ACCOUNT_ENTITY_NOT_FOUND',
      fatal: true,
    });
  }

  return accountEntity;
}

async function fetchAccount(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
) {
  const { instance, jobState } = context;
  const orgId = instance.config.snykOrgId;
  const serviceEntity = createServiceEntity(orgId);
  await jobState.addEntity(serviceEntity);

  await jobState.setData(SetDataKeys.ACCOUNT_ENTITY, serviceEntity);
}

async function fetchFindings({
  jobState,
  instance,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const serviceEntity = await getAccountEntity(jobState);
  const apiClient = new APIClient(logger, instance.config);

  const entityCache: EntityCache = {
    findingEntities: {},
  };

  await apiClient.iterateProjects(async (project) => {
    const [projectName, packageName] = project.name.split(':');

    await apiClient.iterateIssues(project, async (issue) => {
      const finding = createFindingEntity(issue);
      if (entityCache.findingEntities[finding.id]) {
        if (
          !entityCache.findingEntities[finding.id].targets.includes(projectName)
        ) {
          entityCache.findingEntities[finding.id].targets.push(projectName);
        }
      } else {
        finding.targets.push(projectName);
        finding.identifiedInFile = packageName;
        entityCache.findingEntities[finding.id] = finding;
        await jobState.addRelationship(
          createServiceFindingRelationship(serviceEntity, finding),
        );
      }
    });
  });

  await jobState.addEntities(Object.values(entityCache.findingEntities));
}

async function buildFindingCveCweRelationships({
  jobState,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  await jobState.iterateEntities(
    { _type: Entities.SNYK_FINDING._type },
    async (issueEntity) => {
      const issue = getRawData<AggregatedIssue>(issueEntity);

      if (!issue) {
        logger.warn(
          {
            issue: { _key: issueEntity._key },
          },
          `Could not get raw data for ${Entities.SNYK_FINDING._type} entity.`,
        );
        return;
      }

      for (const cve of issue.issueData.identifiers?.CVE || []) {
        await jobState.addRelationship(
          createMappedRelationship({
            source: issueEntity,
            _class: RelationshipClass.IS,
            _type: MappedRelationships.FINDING_IS_CVE._type,
            target: {
              _class: TargetEntities.CVE._class,
              _type: TargetEntities.CVE._type,
              _key: cve.toLowerCase(),
              name: cve.toUpperCase(),
              displayName: cve.toUpperCase(),
              webLink: CVE_URL_BASE + cve.toUpperCase(),
            },
          }),
        );
      }

      for (const cwe of issue.issueData.identifiers?.CWE || []) {
        await jobState.addRelationship(
          createMappedRelationship({
            source: issueEntity,
            _class: RelationshipClass.EXPLOITS,
            _type: MappedRelationships.FINDING_EXPLOITS_CWE._type,
            target: {
              _class: TargetEntities.CWE._class,
              _type: TargetEntities.CWE._type,
              _key: cwe.toLowerCase(),
              name: cwe.toUpperCase(),
              displayName: cwe.toUpperCase(),
              webLink: `https://cwe.mitre.org/data/definitions/${
                cwe.split('-')[1]
              }.html`,
            },
          }),
        );
      }
    },
  );
}

export const steps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: StepIds.FETCH_ACCOUNT,
    name: 'Fetch Account',
    entities: [Entities.SNYK_ACCOUNT],
    relationships: [],
    executionHandler: fetchAccount,
  },
  {
    id: StepIds.FETCH_FINDINGS,
    name: 'Fetch findings',
    entities: [Entities.SNYK_FINDING],
    relationships: [Relationships.SERVICE_IDENTIFIED_FINDING],
    dependsOn: [StepIds.FETCH_ACCOUNT],
    executionHandler: fetchFindings,
  },
  {
    id: StepIds.BUILD_FINDING_CVE_CWE_RELATIONSHIPS,
    name: 'Build Issue -> CVE/CWE Relationships',
    entities: [],
    relationships: [],
    mappedRelationships: [
      MappedRelationships.FINDING_IS_CVE,
      MappedRelationships.FINDING_EXPLOITS_CWE,
    ],
    dependsOn: [StepIds.FETCH_FINDINGS],
    executionHandler: buildFindingCveCweRelationships,
  },
];
