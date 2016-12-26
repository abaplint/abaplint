import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SET RUN TIME CLOCK RESOLUTION LOW.",
];

statementType(tests, "SET RUN TIME", Statements.SetRunTime);