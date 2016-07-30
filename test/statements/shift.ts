import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

  let tests = [
    "SHIFT ls_param-field.",
    ];

statementType(tests, "SHIFT", Statements.Shift);