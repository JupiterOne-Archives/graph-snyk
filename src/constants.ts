export const SNYK_SERVICE_ENTITY_TYPE = "snyk_scan";
export const SNYK_CODEREPO_ENTITY_TYPE = "code_repo";
export const SNYK_FINDING_ENTITY_TYPE = "snyk_finding";
export const SNYK_VULNERABILITY_ENTITY_TYPE = "snyk_cve";

export const SNYK_SERVICE_CODEREPO_RELATIONSHIP_TYPE =
  "snyk_scan_evaluates_code_repo";
export const SNYK_CODEREPO_FINDING_RELATIONSHIP_TYPE =
  "code_repo_has_snyk_finding";
export const SNYK_FINDING_VULNERABILITY_RELATIONSHIP_TYPE =
  "snyk_finding_is_vulnerability";