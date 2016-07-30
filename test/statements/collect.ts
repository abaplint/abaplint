import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
    "COLLECT WA_VBBE INTO IT_VBBE.",
  ];

statementType(tests, "COLLECT", Statements.Collect);