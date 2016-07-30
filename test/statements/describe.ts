import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

  let tests = [
    "describe table lt_foo lines lv_lines.",
    ];

statementType(tests, "DESCRIBE", Statements.Describe);