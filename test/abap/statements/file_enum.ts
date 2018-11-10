import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements";

let tests = [
  "TYPES END OF ENUM name STRUCTURE name2.",
];

statementType(tests, "TYPE ENUM END", Statements.TypeEnumEnd);