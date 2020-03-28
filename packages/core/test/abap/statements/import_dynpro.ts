import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "IMPORT DYNPRO ls_h lt_f lt_e lt_m ID ls_dynp_id.",
];

statementType(tests, "IMPORT DYNPRO", Statements.ImportDynpro);