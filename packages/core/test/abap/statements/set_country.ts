import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "set country 'DE'.",
];

statementType(tests, "SET COUNTRY", Statements.SetCountry);

const versionsFail = [
  {abap: `set country 'DE'.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "SET COUNTRY");
