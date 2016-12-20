import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "free memory id ls_structure.",
];

statementType(tests, "FREE MEMORY", Statements.FreeMemory);