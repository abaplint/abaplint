import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

  let tests = [
    "continue.",
    ];

statementType(tests, "CONTINUE", Statements.Continue);