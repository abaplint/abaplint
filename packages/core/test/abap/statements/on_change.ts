import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "ON CHANGE OF structure-field.",
  "ON CHANGE OF gt_tab-field1 OR gt_tab-field2.",
];

statementType(tests, "ON CHANGE", Statements.OnChange);

const versionsFail = [
  {abap: `ON CHANGE OF structure-field.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "ON CHANGE");
