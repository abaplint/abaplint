import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "MODIFY SCREEN.",
  "modify table index sy-index from item.",
];

statementType(tests, "MODIFY", Statements.ModifyInternal);