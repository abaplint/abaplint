import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "TYPES END OF gty_icon.",
];

statementType(tests, "TYPE END", Statements.TypeEnd);