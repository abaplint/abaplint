import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "ENDPROVIDE.",
];

statementType(tests, "ENDPROVIDE", Statements.EndProvide);