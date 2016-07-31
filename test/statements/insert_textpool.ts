import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "INSERT TEXTPOOL is_progdir-name FROM it_tpool LANGUAGE mv_language STATE 'I'.",
];

statementType(tests, "INSERT TEXTPOOL", Statements.InsertTextpool);