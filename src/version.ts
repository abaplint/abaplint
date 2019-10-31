// todo, refactor, this can be done smarter somehow?

export enum Version {
  v700,
  v702,
  v740sp02,
  v740sp05,
  v740sp08,
  v750,
  v751,
  v752,
  v753,
  v754,
  v755,
  Cloud,
}

export function versionToText(v: Version): string {
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
    case Version.v751:
      return "v751";
    case Version.v752:
      return "v752";
    case Version.v753:
      return "v753";
    case Version.v754:
      return "v754";
    case Version.v755:
      return "v755";
    case Version.Cloud:
      return "Cloud";
    default:
      throw "Unknown version: " + v;
  }
}

export function textToVersion(s: string): Version {
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
    case "v751":
      return Version.v751;
    case "v752":
      return Version.v752;
    case "v753":
      return Version.v753;
    case "v754":
      return Version.v754;
    case "v755":
      return Version.v755;
    case "Cloud":
      return Version.Cloud;
    default:
      throw "Unknown version: " + s;
  }
}