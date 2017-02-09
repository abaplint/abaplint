import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "DELETE TEXTPOOL ls_foo-name.",
  "DELETE TEXTPOOL lv_pool LANGUAGE '*'.",
];

statementType(tests, "DELETE TEXTPOOL", Statements.DeleteTextpool);