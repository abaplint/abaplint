import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "CALL TRANSFORMATION id\n" +
  "  SOURCE data = is_data\n" +
  "  RESULT XML rv_xml.",

  "CALL TRANSFORMATION id\n" +
  "  OPTIONS value_handling = 'accept_data_loss'\n" +
  "  SOURCE XML lv_xml\n" +
  "  RESULT data = rs_data.",

  "CALL TRANSFORMATION id\n" +
  "  SOURCE (lt_stab)\n" +
  "  RESULT XML li_doc.",

  "CALL TRANSFORMATION id\n" +
  "  OPTIONS value_handling = 'accept_data_loss'\n" +
  "  SOURCE XML mi_xml_doc\n" +
  "  RESULT (lt_rtab).",

  "CALL TRANSFORMATION id\n" +
  "  SOURCE XML lv_json\n" +
  "  RESULT data = <lg_comp>.",

  "CALL TRANSFORMATION foo\n" +
  "  SOURCE bar = moo\n" +
  "  RESULT XML lv_xml\n" +
  "  OPTIONS xml_header = 'NO'.",

  "CALL TRANSFORMATION id\n" +
  "  SOURCE foo = bar\n" +
  "         moo = boo\n" +
  "  RESULT XML lv_xml.",

  "CALL TRANSFORMATION id\n" +
  "  SOURCE foo = 'sdf'\n" +
  "         moo = boo\n" +
  "  RESULT XML lv_xml.",

  "CALL TRANSFORMATION (tran)\n" +
  "  SOURCE root = bar\n" +
  "  RESULT XML result.",

  "CALL TRANSFORMATION id\n" +
  "  SOURCE XML xmlstr\n" +
  "  RESULT foo = bar\n" +
  "         moo = boo.",

  "CALL TRANSFORMATION id\n" +
  "  PARAMETERS mode = 'LO'\n" +
  "  SOURCE simple_struc = simple_struc\n" +
  "  RESULT XML lv_bar.",
];

statementType(tests, "CALL TRANSFORMATION", Statements.CallTransformation);