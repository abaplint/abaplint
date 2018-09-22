import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "EXPORT DYNPRO H F E M ID KEY.",
];

statementType(tests, "EXPORT DYNPRO", Statements.ExportDynpro);