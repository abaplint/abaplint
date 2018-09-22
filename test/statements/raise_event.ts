import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "RAISE EVENT message.",
  "RAISE EVENT message EXPORTING p_kind    = c_error p_test    = c_my_name.",
];

statementType(tests, "RAISE EVENT", Statements.RaiseEvent);