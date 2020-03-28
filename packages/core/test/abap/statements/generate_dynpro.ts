import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "GENERATE DYNPRO H F E M ID key MESSAGE field1 LINE field2 WORD field3.",
  "GENERATE DYNPRO ls_header lt_fieldlist lt_flowlogic lt_matchcode ID lv_id MESSAGE l_mess WORD l_word LINE l_line.",
];

statementType(tests, "GENERATE DYNPRO", Statements.GenerateDynpro);