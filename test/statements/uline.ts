import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "ULINE.",
  "ULINE (92).",
  "ULINE /(80).",
  "ULINE /1(76).",
  "ULINE AT /.",
];

statementType(tests, "ULINE", Statements.Uline);