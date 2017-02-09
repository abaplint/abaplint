import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "TYPES BEGIN OF gty_icon.",
  "TYPES BEGIN OF /foo/bar.",
];

statementType(tests, "TYPE BEGIN", Statements.TypeBegin);