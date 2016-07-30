import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

  let tests = [
    "condense lv_foo.",
    ];

statementType(tests, "CONDENSE", Statements.Condense);