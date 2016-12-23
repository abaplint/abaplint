import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "DELETE TEXTPOOL ls_foo-name.",
];

statementType(tests, "DELETE TEXTPOOL", Statements.DeleteTextpool);