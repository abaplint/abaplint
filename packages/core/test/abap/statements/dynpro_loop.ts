import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  `LOOP AT tb_exit INTO st_exit WITH CONTROL ctrl_exit CURSOR ctrl_exit-current_line.`,
];

statementType(tests, "dynpro LOOP", Statements.DynproLoop);
