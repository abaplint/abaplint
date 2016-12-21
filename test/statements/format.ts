import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "FORMAT COLOR COL_GROUP.",
  "format intensified = 0 color = 0 inverse = 0.",
];

statementType(tests, "FORMAT", Statements.Format);