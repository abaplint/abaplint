import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "SET EXTENDED CHECK OFF.",
  "SET EXTENDED CHECK ON.",
];

statementType(tests, "SET EXTENDED CHECK", Statements.SetExtendedCheck);

const versionsFail = [
  {abap: `SET EXTENDED CHECK OFF.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "SET EXTENDED CHECK");
