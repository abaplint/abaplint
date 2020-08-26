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
];

statementType(tests, "PROVIDE", Statements.Provide);