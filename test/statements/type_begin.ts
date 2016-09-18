import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "TYPES BEGIN OF gty_icon.",
];

statementType(tests, "TYPE BEGIN", Statements.TypeBegin);