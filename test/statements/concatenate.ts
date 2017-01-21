import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "concatenate space space into lv_foo.",
  "CONCATENATE lv_tmp iv_pack INTO lv_xstring IN BYTE MODE.",
  "CONCATENATE lv_tmp iv_pack INTO lv_xstring IN CHARACTER MODE.",
  "CONCATENATE lv_result '0' lv_bits+21(7) INTO lv_result.",
  "CONCATENATE foo bar INTO lv_result RESPECTING BLANKS.",
  "CONCATENATE <ls_file>-file-path+1 <ls_file>-file-filename INTO lv_filename.",
  "CONCATENATE <ls_node>-chmod <ls_node>-name INTO lv_string SEPARATED BY space.",
  "CONCATENATE lv_result lv_base+lv_offset(lv_len) INTO lv_result IN BYTE MODE.",
  "CONCATENATE '/SAP/PUBLIC/zgit/' 'script.js' INTO lv_url.",
  "CONCATENATE LINES OF tab INTO <fs> SEPARATED BY lv_sep RESPECTING BLANKS.",
];

statementType(tests, "CONCATENATE", Statements.Concatenate);