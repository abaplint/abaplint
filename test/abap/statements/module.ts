import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "MODULE user_command_2000 INPUT.",
  "MODULE pbo_2000 OUTPUT.",
  "MODULE okcode.",
];

statementType(tests, "MODULE", Statements.Module);