import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "TYPES ty_type TYPE c LENGTH 6.",
  "TYPE ty_type TYPE c LENGTH 6.",
  "TYPES BEGIN OF gty_icon.",
];

statementType(tests, "TYPE", Statements.Type);