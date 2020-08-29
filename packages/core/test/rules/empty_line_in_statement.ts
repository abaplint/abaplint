import {testRule} from "./_utils";
import {EmptyLineinStatement} from "../../src/rules";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "parser\n\nerror", cnt: 0},
  {abap: "EXIT.", cnt: 0},
  {abap: `SELECT kunnr INTO lv_kunnr FROM kna1.
            CHECK sy-dbcnt > is_paging-skip.
          ENDSELECT.`, cnt: 0},
  {abap: `WRITE: foo,
            bar.`, cnt: 0},
  {abap: `WRITE


            bar.`, cnt: 1},
  {abap: "* comment\n\nWRITE bar.", cnt: 0},
  {abap: `DATA: ls_header         TYPE rpy_dyhead,
          lt_containers           TYPE dycatt_tab,
          lt_fields_to_containers TYPE dyfatc_tab,
          lt_flow_logic           TYPE swydyflow.`, cnt: 0},
];

testRule(tests, EmptyLineinStatement);