import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

  let tests = [
    "FORMAT COLOR COL_GROUP.",
    ];

statementType(tests, "FORMAT", Statements.Format);