export interface DeconstructedDescription {
  description?: string;
  impact?: string;
  recommendations?: string;
  references?: string;
}

export function deconstructDesc({
  desc,
}: {
  desc?: string;
}): DeconstructedDescription | undefined {
  return desc?.split('##').reduce((acc: DeconstructedDescription, curr) => {
    if (curr.includes('Remediation'))
      acc.recommendations = curr.replace(/Remediation/g, '').trim();
    else if (curr.includes('References'))
      acc.references = curr.replace(/References/g, '').trim();
    else {
      if (curr.includes('\n\nAn attacker ')) {
        const splitOverview = curr.split('\n\n');
        acc.impact = splitOverview[1].trim();
        acc.description = splitOverview[0].replace(/Overview/g, '').trim();
      } else acc.description = curr.replace(/Overview/g, '').trim();
    }

    return acc;
  }, {});
}
