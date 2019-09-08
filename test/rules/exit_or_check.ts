import {ExitOrCheck} from "../../src/rules/exit_or_check";
import {testRule} from "./_utils";

const tests = [
  {abap: `LOOP AT lt_usr02 INTO ls_usr02.
            EXIT.
          ENDLOOP.`, cnt: 0},
  {abap: "EXIT.", cnt: 1},
  {abap: "CHECK foo = bar.", cnt: 1},
  {abap: `SELECT kunnr INTO lv_kunnr FROM kna1.
            CHECK sy-dbcnt > is_paging-skip.
          ENDSELECT.`, cnt: 0},
];

testRule(tests, ExitOrCheck);