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

function rejoinFileScannedPath(fileScannedPathParts: string[]) {
  return fileScannedPathParts.slice(0, -1).join('/');
}

function lastEl(els: string[]): string {
  return els[els.length - 1];
}

function parseSnykProjectFileScannedPath(fileScannedPath: string) {
  // Possible cases:
  //
  // `subdir/package.json` => ['subdir', 'package.json']
  // `subdir/subdir2/package.json` => ['subdir', 'subdir2', 'package.json']
  // `package.json` => ['package.json']
  const fileScannedPathSplit = fileScannedPath.split('/');

  let fullDirectoryPath: string | undefined;
  let topLevelDirectoryName: string | undefined;
  let fileName: string | undefined;

  if (fileScannedPathSplit.length > 1) {
    fileName = lastEl(fileScannedPathSplit);
    fullDirectoryPath = rejoinFileScannedPath(fileScannedPathSplit);
    topLevelDirectoryName = fileScannedPathSplit[0];
  } else {
    [fileName] = fileScannedPathSplit;
  }

  return {
    fullDirectoryPath,
    topLevelDirectoryName,
    fileName,
  };
}

type ParseSnykProjectNameResult = {
  repoFullName?: string;
  repoOrganization?: string;
  repoName?: string;
  /**
   * The full path to the directory which contains the scanned file
   *
   * Example scanned file: `my/directory/path/package.json`
   * Example `fullDirectoryPath`: `my/directory/path`
   */
  fullDirectoryPath?: string;
  /**
   * The top level directory which contains the scanned file
   *
   * Example scanned file: `my/directory/path/package.json`
   * Example `topLevelDirectoryName`: `my`
   */
  topLevelDirectoryName?: string;
  fileName?: string;
};

function getUnknownSnykProjectNameParseResult(): ParseSnykProjectNameResult {
  // Some unknown format for projects that clearly doesn't match the
  // traditional code repo format
  return {
    repoFullName: undefined,
    repoOrganization: undefined,
    repoName: undefined,
    fullDirectoryPath: undefined,
    topLevelDirectoryName: undefined,
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
  // Input 3. `starbase-test/subdir/starbase:package.json`

  //
  // Output 1. ['starbase-test/starbase', 'subdir/package.json']
  // Output 2. ['starbase-test/starbase', 'package.json']
  // Output 3. ['starbase-test/subdir/starbase', 'package.json']
  const [repoFullName, fileScannedPath] = projectName.split(':');
  if (!repoFullName) return getUnknownSnykProjectNameParseResult();

  // `starbase-test/subdir/starbase` => `starbase`
  const [repoOrganization, ...rest] = repoFullName.split('/');
  const repoName = rest.pop();
  if (!repoOrganization || !repoName)
    return getUnknownSnykProjectNameParseResult();

  let fullDirectoryPath: string | undefined;
  let topLevelDirectoryName: string | undefined;
  let fileName: string | undefined;

  if (fileScannedPath) {
    ({
      fullDirectoryPath,
      topLevelDirectoryName,
      fileName,
    } = parseSnykProjectFileScannedPath(fileScannedPath));
  }

  return {
    repoFullName: repoFullName.toLowerCase(),
    repoOrganization: repoOrganization.toLowerCase(),
    repoName: repoName.toLowerCase(),
    fullDirectoryPath: fullDirectoryPath?.toLowerCase(),
    topLevelDirectoryName: topLevelDirectoryName?.toLowerCase(),
    fileName,
  };
}

export { isSupportedCodeRepoOrigin, parseSnykProjectName };
