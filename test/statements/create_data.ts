import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "CREATE DATA et_table LIKE io_grid->mt_outtab.",
  "create data wa like line of <f_excel_tab>.",
  "CREATE DATA lr_tab_ref TYPE STANDARD TABLE OF (pv_tabname).",
  "CREATE DATA lr_data LIKE STANDARD TABLE OF <fs_comp>.",
  "CREATE DATA lr_format TYPE STANDARD TABLE OF (<ls_foo>-tabname) WITH DEFAULT KEY.",
  "CREATE DATA lr_area TYPE REF TO zcl_area.",
  "CREATE DATA wo_data   TYPE HANDLE lo_table.",
  "CREATE DATA result TYPE n LENGTH lv_length.",
  "CREATE DATA result TYPE p LENGTH lv_length DECIMALS lv_decimals.",
  "CREATE DATA dref.",
  "CREATE DATA result LIKE TABLE OF <ls>.",
  "CREATE DATA result TYPE TABLE OF (ls_foo-bar).",
];

statementType(tests, "CREATE DATA", Statements.CreateData);