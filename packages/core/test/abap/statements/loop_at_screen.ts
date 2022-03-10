import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Version} from "../../../src/version";

const tests = [
  "LOOP AT SCREEN.",
  "LOOP AT SCREEN INTO DATA(line).",
];

statementType(tests, "LOOP AT SCREEN", Statements.LoopAtScreen);

const versionsFail = [
  {abap: "LOOP AT SCREEN.", ver: Version.Cloud},
];

statementVersionFail(versionsFail, "LOOP AT SCREEN");