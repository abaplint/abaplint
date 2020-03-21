import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
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

  "CALL TRANSFORMATION (foo)\n" +
  "  SOURCE root = im_data\n" +
  "  OPTIONS xml_header = 'no'\n" +
  "          value_handling  = 'move'\n" +
  "          technical_types = 'ignore'\n" +
  "          initial_components = 'suppress'\n" +
  "          data_refs = 'heap-or-create'\n" +
  "  RESULT XML lv_.",

  "CALL TRANSFORMATION foo\n" +
  "  PARAMETERS id = id \n" +
  "             toggle = '1' \n" +
  "  SOURCE XML lv_source\n" +
  "  RESULT XML lv_result.",

  "call transformation (lv_name)\n" +
  "  parameters (lt_par)\n" +
  "  objects (lt_obj)\n" +
  "  source xml lv_xml\n" +
  "  result xml rv_res.",
];

statementType(tests, "CALL TRANSFORMATION", Statements.CallTransformation);