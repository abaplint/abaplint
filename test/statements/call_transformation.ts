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
];

statementType(tests, "CALL TRANSFORMATION", Statements.CallTransformation);