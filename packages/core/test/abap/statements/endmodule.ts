import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  `ENDMODULE.`,
];

statementType(tests, "ENDMODULE", Statements.EndModule);

const versionsFail = [
  {abap: `ENDMODULE.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "ENDMODULE");
