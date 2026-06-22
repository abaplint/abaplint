import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "FORMAT COLOR 1.",
  "format color 2 intensified off.",
  "format color 3 intensified on.",
  "FORMAT COLOR 4 INTENSIFIED HOTSPOT OFF.",
  "FORMAT COLOR 5 ON.",
  "format color off intensified off inverse off hotspot off input off.",
  "format intensified = 0 color = 0 inverse = 0.",
  "FORMAT FRAMES OFF.",
  "FORMAT COLOR 6 INVERSE.",
  "FORMAT COLOR 3 INTENSIFIED.",
  "FORMAT COLOR 1 OFF.",
  "FORMAT INTENSIFIED OFF.",
  "FORMAT COLOR COL_NEGATIVE INVERSE INTENSIFIED.",
  "FORMAT HOTSPOT.",
  "FORMAT COLOR COL_HEADING.",
  `FORMAT INTENSIFIED INPUT.`,
  `FORMAT COLOR INTENSIFIED OFF.`,
  `FORMAT COLOR COLOR OFF INTENSIFIED ON.`,
];

statementType(tests, "FORMAT", Statements.Format);

const versionsFail = [
  {abap: `FORMAT COLOR 1.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "FORMAT");
