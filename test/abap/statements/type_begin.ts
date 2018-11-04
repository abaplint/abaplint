import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "TYPES BEGIN OF gty_icon.",
  "TYPES BEGIN OF /foo/bar.",
];

statementType(tests, "TYPE BEGIN", Statements.TypeBegin);