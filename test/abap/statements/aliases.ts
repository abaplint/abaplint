import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "ALIASES mo_files FOR lif_object~mo_files.",
];

statementType(tests, "ALIASES", Statements.Aliases);