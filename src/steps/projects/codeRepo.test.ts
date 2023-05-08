import { isSupportedCodeRepoOrigin, parseSnykProjectName } from './codeRepo';

describe('#isSupportedCodeRepoOrigin', () => {
  test('should return `true` if origin is supported', () => {
    expect(isSupportedCodeRepoOrigin('github')).toEqual(true);
    expect(isSupportedCodeRepoOrigin('bitbucket')).toEqual(true);
    expect(isSupportedCodeRepoOrigin('gitlab')).toEqual(true);

    // Not sure whether this is a legit origin, but it includes `github`! :)
    // There doesn't seem to be a documented list of supported origins and we'd
    // like for this to support GitHub Enterprise, Bitbucket Enterprise, etc.
    expect(isSupportedCodeRepoOrigin('github-enterprise')).toEqual(true);
  });

  test('should return `false` if origin is supported', () => {
    expect(isSupportedCodeRepoOrigin('something')).toEqual(false);
  });
});

describe('#parseSnykProjectName', () => {
  test('should return parsed Snyk project when full file path supplied', () => {
    expect(parseSnykProjectName('starbase-test/starbase:package.json')).toEqual(
      {
        repoFullName: 'starbase-test/starbase',
        repoOrganization: 'starbase-test',
        repoName: 'starbase',
        directoryName: undefined,
        fileName: 'package.json',
      },
    );
  });

  test('should return parsed Snyk project when project without file path supplied', () => {
    expect(parseSnykProjectName('starbase-test/starbase')).toEqual({
      repoFullName: 'starbase-test/starbase',
      repoOrganization: 'starbase-test',
      repoName: 'starbase',
      directoryName: undefined,
      fileName: undefined,
    });
  });

  test('should return undefined when no org name found', () => {
    expect(parseSnykProjectName('')).toEqual({
      repoFullName: undefined,
      repoOrganization: undefined,
      repoName: undefined,
      directoryName: undefined,
      fileName: undefined,
    });
  });

  test('should parse subdirectory information', () => {
    // starbase-test/starbase:subdir/package.json
    expect(
      parseSnykProjectName('starbase-test/starbase:subdir/package.json'),
    ).toEqual({
      repoFullName: 'starbase-test/starbase',
      repoOrganization: 'starbase-test',
      repoName: 'starbase',
      fullDirectoryPath: 'subdir',
      topLevelDirectoryName: 'subdir',
      fileName: 'package.json',
    });
  });

  test('should handle multiple subdirectories', () => {
    expect(
      parseSnykProjectName(
        'starbase-test/starbase:my-directory/sub-dir-1/sub-dir-2/package.json',
      ),
    ).toEqual({
      repoFullName: 'starbase-test/starbase',
      repoOrganization: 'starbase-test',
      repoName: 'starbase',
      fullDirectoryPath: 'my-directory/sub-dir-1/sub-dir-2',
      topLevelDirectoryName: 'my-directory',
      fileName: 'package.json',
    });
  });

  test('should return undefined when no repo name found', () => {
    expect(parseSnykProjectName('starbase')).toEqual({
      repoFullName: undefined,
      repoOrganization: undefined,
      repoName: undefined,
      directoryName: undefined,
      fileName: undefined,
    });
  });
});
