import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "top-of-page.",
  "top-of-page during line-selection.",
];

statementType(tests, "TOP-OF-PAGE", Statements.TopOfPage);