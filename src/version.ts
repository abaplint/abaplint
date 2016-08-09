export enum Version {
  v702,
  v740sp08,
  v750,
};

export function versionDescription(v: Version): string {
  switch (v) {
    case Version.v702:
      return "v702";
    case Version.v740sp08:
      return "v740sp08";
    case Version.v750:
      return "v750";
    default:
      return "Unknown version";
  }
}