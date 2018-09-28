import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "GET CURSOR FIELD f LINE l.",
  "get cursor line l.",
  "GET CURSOR OFFSET off.",
  "GET CURSOR FIELD gv_field.",
  "GET CURSOR LINE lin OFFSET off VALUE val LENGTH len.",
  "GET CURSOR FIELD lv_field AREA lv_ara.",
  "get cursor line L_LIST_CURSOR_LINE display offset L_LIST_CURSOR_POS.",
];

statementType(tests, "GET CURSOR", Statements.GetCursor);