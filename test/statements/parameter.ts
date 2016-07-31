import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "PARAMETERS p_insp TYPE sciins_inf-inspecname OBLIGATORY.",
];

statementType(tests, "PARAMETER", Statements.Parameter);