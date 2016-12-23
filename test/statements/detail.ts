import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "DETAIL.",
];

statementType(tests, "DETAIL", Statements.Detail);