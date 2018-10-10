import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "CLASS foobar IMPLEMENTATION.",
];

statementType(tests, "CLASS", Statements.ClassImplementation);