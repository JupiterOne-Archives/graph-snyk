import {
  EntityFromIntegration,
  EntityOperation,
  IntegrationExecutionContext,
  MappedRelationshipFromIntegration,
  PersisterOperations,
  RelationshipFromIntegration,
  RelationshipOperation,
} from "@jupiterone/jupiter-managed-integration-sdk";
import {
  //SNYK_CODEREPO_ENTITY_TYPE,
  //SNYK_CODEREPO_FINDING_RELATIONSHIP_TYPE,
  SNYK_FINDING_CVE_RELATIONSHIP_TYPE,
  SNYK_FINDING_CWE_RELATIONSHIP_TYPE,
  SNYK_FINDING_ENTITY_TYPE,
  //SNYK_SERVICE_CODEREPO_RELATIONSHIP_TYPE,
  SNYK_SERVICE_SNYK_FINDING_RELATIONSHIP_TYPE, //
  SNYK_SERVICE_ENTITY_TYPE,
} from "./constants";
import {
  //CodeRepoEntity,
  //CodeRepoFindingRelationship,
  FindingCWERelationship,
  FindingEntity,
  FindingVulnerabilityRelationship,
  //ServiceCodeRepoRelationship,
  ServiceFindingRelationship,
  ServiceEntity,
} from "./types";

export async function createOperationsFromFindings(
  context: IntegrationExecutionContext,
  serviceEntities: ServiceEntity[],
  //codeRepoEntities: CodeRepoEntity[],
  findingEntities: FindingEntity[],
  //serviceCodeRepoRelationships: ServiceCodeRepoRelationship[],
  //codeRepoFindingRelationships: CodeRepoFindingRelationship[],
  serviceFindingRelationships: ServiceFindingRelationship[], //
  findingVulnerabilityRelationships: FindingVulnerabilityRelationship[],
  findingWeaknessRelationships: FindingCWERelationship[],
): Promise<PersisterOperations> {
  const entityOperations = [
    ...(await toEntityOperations(
      context,
      serviceEntities,
      SNYK_SERVICE_ENTITY_TYPE,
    )),
    /*
    ...(await toEntityOperations(
      context,
      codeRepoEntities,
      SNYK_CODEREPO_ENTITY_TYPE,
    )),
    */
    ...(await toEntityOperations(
      context,
      findingEntities,
      SNYK_FINDING_ENTITY_TYPE,
    )),
  ];

  const relationshipOperations = [
    /*
    ...(await toRelationshipOperations(
      context,
      serviceCodeRepoRelationships,
      SNYK_SERVICE_CODEREPO_RELATIONSHIP_TYPE,
    )),
    ...(await toRelationshipOperations(
      context,
      codeRepoFindingRelationships,
      SNYK_CODEREPO_FINDING_RELATIONSHIP_TYPE,
    )),
    */
     ...(await toRelationshipOperations(
      context,
      serviceFindingRelationships,
      SNYK_SERVICE_SNYK_FINDING_RELATIONSHIP_TYPE,
    )),
    ...(await toMappedRelationshipOperations(
      context,
      findingVulnerabilityRelationships,
      SNYK_FINDING_CVE_RELATIONSHIP_TYPE,
    )),
    ...(await toMappedRelationshipOperations(
      context,
      findingWeaknessRelationships,
      SNYK_FINDING_CWE_RELATIONSHIP_TYPE,
    )),
  ];

  return [entityOperations, relationshipOperations];
}

async function toEntityOperations<T extends EntityFromIntegration>(
  context: IntegrationExecutionContext,
  entities: T[],
  type: string,
): Promise<EntityOperation[]> {
  const { graph, persister } = context.clients.getClients();
  const oldEntities = await graph.findEntitiesByType(type);
  return persister.processEntities(oldEntities, entities);
}

async function toRelationshipOperations<T extends RelationshipFromIntegration>(
  context: IntegrationExecutionContext,
  relationships: T[],
  type: string,
): Promise<RelationshipOperation[]> {
  const { graph, persister } = context.clients.getClients();
  const oldRelationships = await graph.findRelationshipsByType(type);
  return persister.processRelationships(oldRelationships, relationships);
}

async function toMappedRelationshipOperations<
  T extends MappedRelationshipFromIntegration
>(
  context: IntegrationExecutionContext,
  relationships: T[],
  type: string,
): Promise<RelationshipOperation[]> {
  const { graph, persister } = context.clients.getClients();
  const oldRelationships = await graph.findRelationshipsByType(type);
  return persister.processRelationships(oldRelationships, relationships);
}
