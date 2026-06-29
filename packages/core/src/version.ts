/** @deprecated Use ABAPRelease and Release instead */
export enum Version {
  OpenABAP = "open-abap", // as 702, but with some extra new language features
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
  v756 = "v756",
  v757 = "v757",
  v758 = "v758",
  Cloud = "Cloud", // Steampunk, SAP BTP ABAP Environment
}

export const defaultVersion = Version.v758;

export function getPreviousVersion(v: Version): Version {
  if (v === Version.OpenABAP) {
    return Version.v702;
  }

  const all = Object.values(Version);

  const found = all.indexOf(v);
  if (found < 0) {
    throw "Unknown version: " + v;
  } else if (found === 0) {
    throw "Nothing lower: " + v;
  }

  return all[found - 1];
}

//////////////////////////////////////////////////////////

/**
 * Dialect / flavor axis, orthogonal to the on-prem/cloud release track.
 *
 * `Normal`  = full ABAP, no restrictions.
 * `Cloud`   = restricted ABAP for Cloud, syntactic and semantic restrictions apply.
 * `KeyUser` = stricter still (KeyUser Extensibility), strict subset of Cloud.
 *
 * Ordering: KeyUser(0) < Cloud(1) < Normal(2) — lower = more restrictive.
 */
export enum LanguageVersion {
  Normal = "Normal",
  KeyUser = "KeyUser",
  Cloud = "Cloud",
}

export interface ABAPRelease {
  readonly name: string;          // key in Release map, e.g. "v740sp05", "v793", "Newest"
  readonly abap: string | null;   // SAP_BASIS name, e.g. "740SP05", "7.93", null for Newest
  readonly kernel: number | null;
  readonly op: number | null;
  readonly cloud: number | null;
  readonly ce: number | null;
  readonly ordinal: number;
}

type ReleaseDefRaw = Omit<ABAPRelease, "ordinal" | "name">;

const releaseDefsRaw: readonly [string, ReleaseDefRaw][] = [
  // Pre-cloud on-prem releases. kernel == op for these.
  ["v700", {abap: "700", kernel: 700, op: 700, cloud: null, ce: null}],
  ["v701", {abap: "701", kernel: 701, op: 701, cloud: null, ce: null}],
  ["v702", {abap: "702", kernel: 702, op: 702, cloud: null, ce: null}],
  ["v710", {abap: "710", kernel: 710, op: 710, cloud: null, ce: null}],
  ["v711", {abap: "711", kernel: 711, op: 711, cloud: null, ce: null}],
  ["v720", {abap: "720", kernel: 720, op: 720, cloud: null, ce: null}],
  ["v722", {abap: "722", kernel: 722, op: 722, cloud: null, ce: null}],
  ["v730", {abap: "730", kernel: 730, op: 730, cloud: null, ce: null}],
  ["v731", {abap: "731", kernel: 731, op: 731, cloud: null, ce: null}],
  ["v740sp02", {abap: "740SP02", kernel: 740, op: 740, cloud: null, ce: null}],
  ["v740sp05", {abap: "740SP05", kernel: 741, op: 740, cloud: null, ce: null}],
  ["v740sp08", {abap: "740SP08", kernel: 742, op: 740, cloud: null, ce: null}],

  // Cloud-numbered releases. The *last* row at a given op value is that on-prem release.
  // On-prem chain (op-band → anchor cloud row, encoded in op: below):
  //   op 750 : v760 .. v762   (anchor v762 == on-prem 750)
  //   op 751 : v763 .. v765   (anchor v765 == on-prem 751)
  //   op 752 : v766 .. v769   (anchor v769 == on-prem 752)
  //   op 753 : v770 .. v773   (anchor v773 == on-prem 753)
  //   op 754 : v774 .. v777   (anchor v777 == on-prem 754)
  //   op 755 : v778 .. v781   (anchor v781 == on-prem 755)
  //   op 756 : v782 .. v785   (anchor v785 == on-prem 756)
  //   op 757 : v786 .. v789   (anchor v789 == on-prem 757)
  //   op 758 : v790 .. v793   (anchor v793 == on-prem 758)
  //   op 816 : v794 .. v916   (anchor v916 == on-prem 816)
  //   op nul : v917 .. v918   (cloud-only, no on-prem counterpart yet)
  //
  // kernel 743–753 served v760–v770; from v771 kernel == cloud.
  // ce: null means the release was never shipped to customers on any cloud platform.
  ["v760", {abap: "7.60", kernel: 743, op: 750, cloud: 760, ce: null}],
  ["v761", {abap: "7.61", kernel: 744, op: 750, cloud: 761, ce: null}],
  ["v762", {abap: "7.62", kernel: 745, op: 750, cloud: 762, ce: null}],   // == on-prem 750
  ["v763", {abap: "7.63", kernel: 746, op: 751, cloud: 763, ce: null}],
  ["v764", {abap: "7.64", kernel: 747, op: 751, cloud: 764, ce: null}],
  ["v765", {abap: "7.65", kernel: 748, op: 751, cloud: 765, ce: null}],   // == on-prem 751
  ["v766", {abap: "7.66", kernel: 749, op: 752, cloud: 766, ce: null}],
  ["v767", {abap: "7.67", kernel: 750, op: 752, cloud: 767, ce: 1702}],   // S/4 only
  ["v768", {abap: "7.68", kernel: 751, op: 752, cloud: 768, ce: 1705}],   // S/4 only
  ["v769", {abap: "7.69", kernel: 752, op: 752, cloud: 769, ce: 1708}],   // S/4 only == on-prem 752
  ["v770", {abap: "7.70", kernel: 753, op: 753, cloud: 770, ce: 1711}],   // S/4 only
  ["v771", {abap: "7.71", kernel: 771, op: 753, cloud: 771, ce: 1802}],   // S/4 only
  ["v772", {abap: "7.72", kernel: 772, op: 753, cloud: 772, ce: 1805}],   // S/4 only
  ["v773", {abap: "7.73", kernel: 773, op: 753, cloud: 773, ce: 1808}],   // S/4 only == on-prem 753
  ["v774", {abap: "7.74", kernel: 774, op: 754, cloud: 774, ce: 1811}],
  ["v775", {abap: "7.75", kernel: 775, op: 754, cloud: 775, ce: 1902}],
  ["v776", {abap: "7.76", kernel: 776, op: 754, cloud: 776, ce: 1905}],
  ["v777", {abap: "7.77", kernel: 777, op: 754, cloud: 777, ce: 1908}],   // == on-prem 754
  ["v778", {abap: "7.78", kernel: 778, op: 755, cloud: 778, ce: 1911}],
  ["v779", {abap: "7.79", kernel: 779, op: 755, cloud: 779, ce: 2002}],
  ["v780", {abap: "7.80", kernel: 780, op: 755, cloud: 780, ce: 2005}],
  ["v781", {abap: "7.81", kernel: 781, op: 755, cloud: 781, ce: 2008}],   // == on-prem 755
  ["v782", {abap: "7.82", kernel: 782, op: 756, cloud: 782, ce: 2011}],
  ["v783", {abap: "7.83", kernel: 783, op: 756, cloud: 783, ce: 2102}],
  ["v784", {abap: "7.84", kernel: 784, op: 756, cloud: 784, ce: 2105}],
  ["v785", {abap: "7.85", kernel: 785, op: 756, cloud: 785, ce: 2108}],   // == on-prem 756
  ["v786", {abap: "7.86", kernel: 786, op: 757, cloud: 786, ce: 2111}],
  ["v787", {abap: "7.87", kernel: 787, op: 757, cloud: 787, ce: 2202}],
  ["v788", {abap: "7.88", kernel: 788, op: 757, cloud: 788, ce: 2205}],
  ["v789", {abap: "7.89", kernel: 789, op: 757, cloud: 789, ce: 2208}],   // == on-prem 757
  ["v790", {abap: "7.90", kernel: 790, op: 758, cloud: 790, ce: 2211}],
  ["v791", {abap: "7.91", kernel: 791, op: 758, cloud: 791, ce: 2302}],
  ["v792", {abap: "7.92", kernel: 792, op: 758, cloud: 792, ce: 2305}],   // BTP only
  ["v793", {abap: "7.93", kernel: 793, op: 758, cloud: 793, ce: 2308}],   // == on-prem 758
  ["v794", {abap: "7.94", kernel: 794, op: 816, cloud: 794, ce: 2311}],   // BTP only
  ["v795", {abap: "7.95", kernel: 795, op: 816, cloud: 795, ce: 2402}],
  ["v796", {abap: "7.96", kernel: 796, op: 816, cloud: 796, ce: 2405}],   // BTP only
  ["v912", {abap: "9.12", kernel: 912, op: 816, cloud: 912, ce: 2408}],
  ["v913", {abap: "9.13", kernel: 913, op: 816, cloud: 913, ce: 2411}],   // BTP only
  ["v914", {abap: "9.14", kernel: 914, op: 816, cloud: 914, ce: 2502}],
  ["v915", {abap: "9.15", kernel: 915, op: 816, cloud: 915, ce: 2505}],   // BTP only
  ["v916", {abap: "9.16", kernel: 916, op: 816, cloud: 916, ce: 2508}],   // == on-prem 816
  ["v917", {abap: "9.17", kernel: 917, op: null, cloud: 917, ce: 2511}],   // BTP only
  ["v918", {abap: "9.18", kernel: 918, op: null, cloud: 918, ce: 2602}],
  // Newest: always-active sentinel, satisfies any release check
  ["Newest", {abap: null, kernel: null, op: null, cloud: null, ce: null}],
];

/** All known releases in chronological order. Declaration order IS the ordering. */
export const ReleaseList: readonly ABAPRelease[] =
  releaseDefsRaw.map(([name, r], i) => Object.freeze({...r, name, ordinal: i}));

/** Lookup table keyed by release name (e.g. `Release.v740sp05`, `Release.Newest`). */
export const Release: {readonly [name: string]: ABAPRelease} = Object.freeze({
  ...Object.fromEntries(releaseDefsRaw.map(([name], i) => [name, ReleaseList[i]])),
  // Deprecated aliases: on-prem v750–v758 map to last cloud row at that op
  v750: ReleaseList[14],   // 7.62 == on-prem 750
  v751: ReleaseList[17],   // 7.65 == on-prem 751
  v752: ReleaseList[21],   // 7.69 == on-prem 752
  v753: ReleaseList[25],   // 7.73 == on-prem 753
  v754: ReleaseList[29],   // 7.77 == on-prem 754
  v755: ReleaseList[33],   // 7.81 == on-prem 755
  v756: ReleaseList[37],   // 7.85 == on-prem 756
  v757: ReleaseList[41],   // 7.89 == on-prem 757
  v758: ReleaseList[45],   // 7.93 == on-prem 758
  v816: ReleaseList[53],   // 9.16 == on-prem 816
});

export type VersionNew = Version | {release: ABAPRelease, language: LanguageVersion};