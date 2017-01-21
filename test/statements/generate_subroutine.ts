import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "GENERATE SUBROUTINE POOL lt_source\n" +
  "  NAME            l_name\n" +
  "  MESSAGE         l_error\n" +
  "  LINE            l_line.",
];

statementType(tests, "GENERATE SUBROUTINE", Statements.GenerateSubroutine);