import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "INSERT TEXTPOOL is_progdir-name FROM it_tpool LANGUAGE mv_language STATE 'I'.",
  "INSERT textpool l_name FROM it_tpool LANGUAGE sy-langu.",
];

statementType(tests, "INSERT TEXTPOOL", Statements.InsertTextpool);