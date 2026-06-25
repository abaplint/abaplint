import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "CONTROLS tctrl TYPE TABLEVIEW USING SCREEN 200.",
  "CONTROLS tstrip TYPE TABSTRIP.",
];

statementType(tests, "CONTROLS", Statements.Controls);

const versionsFail = [
  {abap: `CONTROLS tctrl TYPE TABLEVIEW USING SCREEN 200.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "CONTROLS");
