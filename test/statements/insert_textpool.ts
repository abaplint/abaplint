import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "INSERT TEXTPOOL is_progdir-name FROM it_tpool LANGUAGE mv_language STATE 'I'.",
  "INSERT textpool l_name FROM it_tpool LANGUAGE sy-langu.",
  "INSERT TEXTPOOL target FROM tab.",
];

statementType(tests, "INSERT TEXTPOOL", Statements.InsertTextpool);