function isSupportedCodeRepoOrigin(projectOrigin: string): boolean {
  // Use `includes` because it isn't clear from the documentation how specific
  // origins are formatted. For example, it's not clear whether there is an
  // origin format difference between GitHub and GitHub Enterprise.
  return (
    projectOrigin.includes('github') ||
    projectOrigin.includes('bitbucket') ||
    projectOrigin.includes('gitlab')
  );
}

function parseSnykProjectName(projectName: string) {
  const [codeRepoProjectFullName, _] = projectName.split(':');
  const [codeRepoOrgName, codeRepoName] = codeRepoProjectFullName.split('/');

  return codeRepoOrgName && codeRepoName
    ? {
        codeRepoOrgName,
        codeRepoName,
      }
    : undefined;
}

export { isSupportedCodeRepoOrigin, parseSnykProjectName };
