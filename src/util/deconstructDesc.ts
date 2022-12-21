export interface DeconstructedDescription {
  description?: string;
  Impact?: string;
  Recommendations?: string;
  References?: string;
}

export function deconstructDesc({
  desc,
}: {
  desc?: string;
}): DeconstructedDescription | undefined {
  return desc?.split('##').reduce((acc: DeconstructedDescription, curr, x) => {
    if (curr.includes('Remediation'))
      acc.Recommendations = curr.replace(/Remediation/g, '').trim();
    else if (curr.includes('References'))
      acc.References = curr.replace(/References/g, '').trim();
    else {
      if (curr.includes('\n\nAn attacker ')) {
        const splitOverview = curr.split('\n\n');
        acc.Impact = splitOverview[1].trim();
        acc.description = splitOverview[0].replace(/Overview/g, '').trim();
      } else acc.description = curr.replace(/Overview/g, '').trim();
    }

    return acc;
  }, {});
}
