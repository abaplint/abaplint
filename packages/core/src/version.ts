export enum Version {
  v700 = "v700",
  v702 = "v702",
  v740sp02 = "v740sp02",
  v740sp05 = "v740sp05",
  v740sp08 = "v740sp08",
  v750 = "v750",
  v751 = "v751",
  v752 = "v752",
  v753 = "v753",
  v754 = "v754",
  v755 = "v755",
  Cloud = "Cloud",
}

export const defaultVersion = Version.v754;

export function getPreviousVersion(v: Version): Version {
  const all = Object.values(Version);

  const found = all.indexOf(v);
  if (found < 0) {
    throw "Unknown version: " + v;
  } else if (found === 0) {
    throw "Nothing lower: " + v;
  }

  return all[found - 1];
}