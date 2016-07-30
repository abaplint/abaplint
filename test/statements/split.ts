import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

  let tests = [
    "SPLIT iv_data AT gc_newline INTO TABLE lt_result.",
    ];

statementType(tests, "SPLIT", Statements.Split);