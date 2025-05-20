import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  `LOOP AT tb_exit INTO st_exit WITH CONTROL ctrl_exit CURSOR ctrl_exit-current_line.`,
  `LOOP AT gt_data_0002 CURSOR gv_c INTO yscreen_0002 FROM gv_n1 TO gv_n2.`,
  `LOOP AT gt_tab INTO tab CURSOR gv_c TO gv_n2.`,
  `LOOP WITH CONTROL tc.`,
];

statementType(tests, "dynpro LOOP", Statements.DynproLoop);
