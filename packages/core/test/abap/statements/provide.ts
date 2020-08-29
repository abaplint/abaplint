import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "PROVIDE FIELDS * \n" +
    "FROM li_temp_join INTO ls_join_temp VALID l_flag BOUNDS datab AND datbi \n" +
    "BETWEEN l_begda AND l_endda.",

  "PROVIDE FIELDS * \n" +
    "FROM li_old INTO ls_old VALID flag1 BOUNDS date_from AND date_to \n" +
    "FIELDS * \n" +
    "FROM li_new INTO ls_new VALID flag2 BOUNDS date_from AND date_to \n" +
    "BETWEEN p_start AND p_end.",

  "provide name from ztab1 name from ztab1 between name1 and name2.",

  "PROVIDE * FROM lt_bar BETWEEN foo AND bar.",
  "PROVIDE * FROM lt_bar BETWEEN foo-begda AND bar-endda.",

  "PROVIDE FIELDS sd FROM lt_sdfsd INTO ls_sdfsd VALID lv_flag BOUNDS begda AND endda BETWEEN <foo>-begda AND <bar>-endda.",

  "PROVIDE field1 field2 FROM sdf BETWEEN bonus AND pn-end.",

  `PROVIDE FIELDS sia_p      FROM lt_t7xa22 INTO ls_t7xa22 VALID lv_flag1 BOUNDS begda AND endda
FIELDS contrib    FROM lt_t7xa23 INTO ls_t7xa23 VALID lv_flag2 BOUNDS begda AND endda
FIELDS amt_perc
       er_contrib FROM lt_t7xa24 INTO ls_t7xa24 VALID lv_flag3 BOUNDS begda AND endda
FIELDS *          FROM lt_9745   INTO ls_9745   VALID lv_flag4 BOUNDS begda AND endda
BETWEEN <p9745>-begda AND <p9745>-endda.`,

];

statementType(tests, "PROVIDE", Statements.Provide);