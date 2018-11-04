import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

let tests = [
  "ALIASES mo_files FOR lif_object~mo_files.",
];

statementType(tests, "ALIASES", Statements.Aliases);