declare module '@jupiterone/snyk-client' {
  export default class SnykModule {
    constructor(apiKey: string, options?: { retries?: number });

    verifyAccess(orgId: string);

    listAllProjects(orgId: string);

    listIssues(orgId: string, projectId: string, filters?: any);

    listAggregatedIssues(orgId: string, projectId: string, filters?: any);
  }
}
