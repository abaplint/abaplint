import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "END-OF-PAGE.",
];

statementType(tests, "END-OF-PAGE", Statements.EndOfPage);