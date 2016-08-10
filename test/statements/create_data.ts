import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "CREATE DATA et_table LIKE io_grid->mt_outtab.",
  "create data wa like line of <f_excel_tab>.",
  "CREATE DATA lr_tab_ref TYPE STANDARD TABLE OF (pv_tabname).",
  "CREATE DATA wo_data   TYPE HANDLE lo_table.",
];

statementType(tests, "CREATE DATA", Statements.CreateData);