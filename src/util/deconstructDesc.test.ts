import { deconstructDesc, DeconstructedDescription } from './deconstructDesc';

const sampleDesc =
  'Overview org.jenkins-ci.main:jenkins-core is an open-source automation server. Affected versions of this package are vulnerable to Authentication Bypass. Due to a missing permissions check, a malicious remote authenticated user may be able to trigger the update process of the site.\n\nAn attacker may be able to trigger the update process of the site ## Remediation Upgrade org.jenkins-ci.main:jenkins-core to versions 1.651.2, 2.3 or higher. ## References - Jenkins Security Advisory - GitHub Commit';

const sampleDescOverview =
  'Overview org.jenkins-ci.main:jenkins-core is an open-source automation server. Affected versions of this package are vulnerable to Authentication Bypass. Due to a missing permissions check, a malicious remote authenticated user may be able to trigger the update process of the site.';

describe('deconstruct-description', () => {
  test('should deconstruct desciption', () => {
    const deconstructedDesc = deconstructDesc({ desc: sampleDesc });
    expect(deconstructedDesc).not.toBe(undefined);

    const {
      description,
      recommendations,
      references,
      impact,
    } = deconstructedDesc as DeconstructedDescription;

    expect(description).toBe(
      'org.jenkins-ci.main:jenkins-core is an open-source automation server. Affected versions of this package are vulnerable to Authentication Bypass. Due to a missing permissions check, a malicious remote authenticated user may be able to trigger the update process of the site.',
    );
    expect(recommendations).toBe(
      'Upgrade org.jenkins-ci.main:jenkins-core to versions 1.651.2, 2.3 or higher.',
    );
    expect(references).toBe('- Jenkins Security Advisory - GitHub Commit');
    expect(impact).toBe(
      'An attacker may be able to trigger the update process of the site',
    );
  });

  test('should return empty string', () => {
    const deconstructedDesc = deconstructDesc({ desc: undefined });
    expect(deconstructedDesc).toBe(undefined);
  });

  test('should return overview only', () => {
    const deconstructedDesc = deconstructDesc({ desc: sampleDescOverview });
    expect(deconstructedDesc).not.toBe(undefined);

    const {
      description,
      recommendations,
      references,
      impact,
    } = deconstructedDesc as DeconstructedDescription;

    expect(description).toBe(
      'org.jenkins-ci.main:jenkins-core is an open-source automation server. Affected versions of this package are vulnerable to Authentication Bypass. Due to a missing permissions check, a malicious remote authenticated user may be able to trigger the update process of the site.',
    );
    expect(recommendations).toBe(undefined);
    expect(references).toBe(undefined);
    expect(impact).toBe(undefined);
  });
});
