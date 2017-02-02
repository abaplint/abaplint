import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SET RUN TIME CLOCK RESOLUTION LOW.",
  "SET RUN TIME CLOCK RESOLUTION HIGH.",
  "SET RUN TIME ANALYZER ON.",
  "SET RUN TIME ANALYZER OFF.",
];

statementType(tests, "SET RUN TIME", Statements.SetRunTime);