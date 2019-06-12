export const SNYK_SERVICE_ENTITY_TYPE = "snyk_scan";
export const SNYK_CODEREPO_ENTITY_TYPE = "code_repo";
export const SNYK_FINDING_ENTITY_TYPE = "snyk_finding";
export const SNYK_CVE_ENTITY_TYPE = "cve";
export const SNYK_CWE_ENTITY_TYPE = "cwe";

export const SNYK_SERVICE_CODEREPO_RELATIONSHIP_TYPE =
  "snyk_scan_evaluates_code_repo";
export const SNYK_CODEREPO_FINDING_RELATIONSHIP_TYPE =
  "code_repo_has_snyk_finding";
export const SNYK_FINDING_CVE_RELATIONSHIP_TYPE =
  "snyk_finding_is_cve";
export const SNYK_FINDING_CWE_RELATIONSHIP_TYPE = 
  "snyk_finding_exploits_cwe"