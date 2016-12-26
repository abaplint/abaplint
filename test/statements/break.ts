import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "break-point.",
  "break-point id foo.",
  "BREAK-POINT AT NEXT APPLICATION STATEMENT.",
  "break username.",
];

statementType(tests, "BREAK-POINT", Statements.Break);