import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "NEW-LINE.",
  "NEW-LINE SCROLLING.",
  "NEW-LINE NO-SCROLLING.",
];

statementType(tests, "NEW-LINE", Statements.NewLine);