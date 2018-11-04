import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "new-page line-size lv_width.",
  "NEW-PAGE NO-TITLE NO-HEADING.",
  "NEW-PAGE WITH-TITLE.",
  "new-page print off.",
  "NEW-PAGE LINE-COUNT 15.",
  "NEW-PAGE WITH-HEADING.",
  "NEW-PAGE PRINT ON PARAMETERS params NO DIALOG.",
  "NEW-PAGE NO-TITLE NO-HEADING PRINT ON PARAMETERS par ARCHIVE PARAMETERS arc NO DIALOG.",
  "NEW-PAGE PRINT ON PARAMETERS params NO DIALOG NEW-SECTION.",
  "NEW-PAGE.",
  "NEW-PAGE PRINT ON DESTINATION 'NULL' NO DIALOG LINE-SIZE 0252 LINE-COUNT 0065.",

  "NEW-PAGE PRINT ON\n" +
  "  DESTINATION 'LOCAL'\n" +
  "  COVER TEXT gv_text\n" +
  "  LIST AUTHORITY 'AUTH'\n" +
  "  IMMEDIATELY ' '\n" +
  "  KEEP IN SPOOL 'X'\n" +
  "  LINE-SIZE 182\n" +
  "  LINE-COUNT 65\n" +
  "  NO DIALOG.",

  "NEW-PAGE PRINT ON\n" +
  "  LIST DATASET lv_name\n" +
  "  COVER TEXT   lv_title\n" +
  "  IMMEDIATELY  ' '\n" +
  "  NEW LIST IDENTIFICATION 'X'\n" +
  "  NO DIALOG.",
];

statementType(tests, "NEW-PAGE", Statements.NewPage);