import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "catch cx_foo.",
  "CATCH cx_pak_invalid_data cx_pak_invalid_state.",
];

statementType(tests, "CATCH", Statements.Catch);