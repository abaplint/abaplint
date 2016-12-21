import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "break-point.",
  "break-point id foo.",
  "break username.",
];

statementType(tests, "BREAK-POINT", Statements.Break);