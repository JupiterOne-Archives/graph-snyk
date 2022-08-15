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

function parseSnykProjectFileScannedPath(fileScannedPath: string) {
  // Two possible cases:
  //
  // `subdir/package.json` => ['subdir', 'package.json']
  // `package.json` => ['package.json']
  const fileScannedPathSplit = fileScannedPath.split('/');

  let directoryName: string | undefined;
  let fileName: string | undefined;

  if (fileScannedPathSplit.length === 2) {
    [directoryName, fileName] = fileScannedPathSplit;
  } else {
    [fileName] = fileScannedPathSplit;
  }

  return {
    directoryName,
    fileName,
  };
}

type ParseSnykProjectNameResult = {
  repoFullName?: string;
  repoOrganization?: string;
  repoName?: string;
  directoryName?: string;
  fileName?: string;
};

function getUnknownSnykProjectNameParseResult(): ParseSnykProjectNameResult {
  // Some unknown format for projects that clearly doesn't match the
  // traditional code repo format
  return {
    repoFullName: undefined,
    repoOrganization: undefined,
    repoName: undefined,
    directoryName: undefined,
    fileName: undefined,
  };
}

/**
 * Parses a Snyk project into several different properties
 *
 * Example input: `starbase-test/starbase:subdir/package.json`
 * Example output:
 *
 * {
 *   repoFullName: 'starbase-test/starbase',
 *   repoOrganization: 'starbase-test',
 *   repoName: 'starbase',
 *   directoryName: 'subdir',
 *   fileName: 'package.json'
 * }
 */
function parseSnykProjectName(projectName: string): ParseSnykProjectNameResult {
  // `projectName` can be in two different formats:
  // Input 1. `starbase-test/starbase:subdir/package.json`
  // Input 2. `starbase-test/starbase:package.json`
  //
  // Output 1. ['starbase-test/starbase', 'subdir/package.json']
  // Output 2. ['starbase-test/starbase', 'package.json']
  const [repoFullName, fileScannedPath] = projectName.split(':');
  if (!repoFullName) return getUnknownSnykProjectNameParseResult();

  // `starbase-test/starbase` => `starbase`
  const [repoOrganization, repoName] = repoFullName.split('/');
  if (!repoOrganization || !repoName)
    return getUnknownSnykProjectNameParseResult();

  let directoryName: string | undefined;
  let fileName: string | undefined;

  if (fileScannedPath) {
    ({ directoryName, fileName } = parseSnykProjectFileScannedPath(
      fileScannedPath,
    ));
  }

  return {
    repoFullName: repoFullName.toLowerCase(),
    repoOrganization: repoOrganization.toLowerCase(),
    repoName: repoName.toLocaleLowerCase(),
    directoryName: directoryName?.toLowerCase(),
    fileName,
  };
}

export { isSupportedCodeRepoOrigin, parseSnykProjectName };
