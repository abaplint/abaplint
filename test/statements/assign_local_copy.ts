import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "ASSIGN LOCAL COPY OF INITIAL LINE OF <table> TO <fs>.",
  "assign local copy of <lt_foo> to <lt_bar>.",
];

statementType(tests, "ASSIGN LOCAL COPY", Statements.AssignLocalCopy);
