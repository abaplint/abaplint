import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
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

  "NEW-PAGE\n" +
  "  PRINT ON\n" +
  "  LINE-SIZE               123\n" +
  "  LIST NAME               lv_name\n" +
  "  LIST AUTHORITY          lv_auth\n" +
  "  DESTINATION             lv_dest\n" +
  "  COVER TEXT              lv_cover_text\n" +
  "  LIST DATASET            lv_list_dataset\n" +
  "  IMMEDIATELY             lv_immediately\n" +
  "  NEW LIST IDENTIFICATION lv_new_list_id\n" +
  "  KEEP IN SPOOL           lv_keep\n" +
  "  LAYOUT                  lv_layot\n" +
  "  SAP COVER PAGE          lv_cover_page\n" +
  "  NO DIALOG.",
];

statementType(tests, "NEW-PAGE", Statements.NewPage);