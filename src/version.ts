// todo, refactor, this can be done smarter somehow?

export enum Version {
  v700,
  v702,
  v740sp02,
  v740sp05,
  v740sp08,
  v750,
}

export function versionDescription(v: Version): string {
  switch (v) {
    case Version.v700:
      return "v700";
    case Version.v702:
      return "v702";
    case Version.v740sp02:
      return "v740sp02";
    case Version.v740sp05:
      return "v740sp05";
    case Version.v740sp08:
      return "v740sp08";
    case Version.v750:
      return "v750";
    default:
      return "Unknown version";
  }
}

export function versionText(s: string): Version {
  switch (s) {
    case "v700":
      return Version.v700;
    case "v702":
      return Version.v702;
    case "v740sp02":
      return Version.v740sp02;
    case "v740sp05":
      return Version.v740sp05;
    case "v740sp08":
      return Version.v740sp08;
    case "v750":
      return Version.v750;
    default:
      throw "unknown version";
  }
}