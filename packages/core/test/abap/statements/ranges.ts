import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "ranges l_prot_only for smodilog-prot_only.",
  "RANGES moo FOR foo-bar OCCURS 50.",
  "RANGES $tadir$ FOR tadir-devclass OCCURS 10.",
  "RANGES lr_prctr FOR <foo>-prctr.",
  `RANGES r_sdata FOR data-sdata(3).`,
  `RANGES foo-bar FOR bar.`,
];

statementType(tests, "RANGES", Statements.Ranges);

const versionsFail = [
  {abap: `ranges l_prot_only for smodilog-prot_only.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "RANGES");
