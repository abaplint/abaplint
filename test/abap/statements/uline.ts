import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "ULINE.",
  "ULINE (92).",
  "ULINE /(80).",
  "ULINE /1(76).",
  "ULINE AT /.",
  "ULINE AT (c_line_size).",
  "ULINE AT /1(80) .",
  "ULINE AT 3(12).",
  "ULINE AT /(right).",
  "ULINE /10.",
  "ULINE AT /(10) NO-GAP.",
// todo
//  "ULINE AT column(length).",
];

statementType(tests, "ULINE", Statements.Uline);