import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "ALIASES mo_files FOR lif_object~mo_files.",
];

statementType(tests, "ALIASES", Statements.Aliases);