import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "WRITE 'foobar'.",
  "WRITE: 'foobar'.",
  ];

statementType(tests, "WRITE", Statements.Write);