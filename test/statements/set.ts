import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SET HANDLER me->on_event FOR mo_html_viewer.",
];

statementType(tests, "SET", Statements.Set);