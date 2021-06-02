import {ExitOrCheck, ExitOrCheckConf} from "../../src/rules/exit_or_check";
import {testRule, testRuleFix} from "./_utils";

const tests = [
  {abap: `LOOP AT lt_usr02 INTO ls_usr02.
            EXIT.
          ENDLOOP.`, cnt: 0},
  {abap: "EXIT.", cnt: 1, fix: true},
  {abap: "CHECK foo = bar.", cnt: 1, fix: true},
  {abap: `SELECT kunnr INTO lv_kunnr FROM kna1.
            CHECK sy-dbcnt > is_paging-skip.
          ENDSELECT.`, cnt: 0},
];

testRule(tests, ExitOrCheck);

const tests2 = [
  {abap: `LOOP AT lt_usr02 INTO ls_usr02.
            EXIT.
          ENDLOOP.`, cnt: 0},
  {abap: "EXIT.", cnt: 0},
  {abap: "CHECK foo = bar.", cnt: 0},
  {abap: `SELECT kunnr INTO lv_kunnr FROM kna1.
            CHECK sy-dbcnt > is_paging-skip.
          ENDSELECT.`, cnt: 0},
];

const config2 = new ExitOrCheckConf();
config2.allowCheck = true;
config2.allowExit = true;
testRule(tests2, ExitOrCheck, config2);

const fixes = [
  {input: "EXIT.", output: "RETURN."},
  {input: "CHECK foo = bar.", output: `IF NOT foo = bar.\n  RETURN.\nENDIF.`},
];

testRuleFix(fixes, ExitOrCheck);