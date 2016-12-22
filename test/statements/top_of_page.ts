import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "top-of-page.",
];

statementType(tests, "TOP-OF-PAGE", Statements.TopOfPage);