import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "DO var TIMES.",
  "DO 10 TIMES.",
  "DO 10 TIMES VARYING FIELD FROM foo NEXT bar.",
];

statementType(tests, "DO", Statements.Do);