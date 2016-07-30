import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

  let tests = [
    "CLEAR foobar.",
    ];

statementType(tests, "CLEAR", Statements.Clear);