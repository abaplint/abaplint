import {NoYodaConditions} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "CALL TRANSACTION 'ZFOO' WITH AUTHORITY-CHECK.", cnt: 0},
  {abap: "sdfdsfds", cnt: 0},
  {abap: "IF a = method( ). ENDIF.", cnt: 1},
  {abap: "IF 0 <> SY-SUBRC. endif.", cnt: 1},
  {abap: "IF SY-SUBRC <> 0. endif.", cnt: 0},
  {abap: "if 2 = 2 + bar. endif.", cnt: 1},
  {abap: "IF abap_false = is_preserved( lv_css_path ). endif.", cnt: 1},
  {abap: "IF is_preserved( lv_css_path ) = abap_false. endif.", cnt: 0},
  {abap: "IF iv_branch_name CP zif_abapgit_definitions=>c_git_branch-heads. ENDIF.", cnt: 0},
];

testRule(tests, NoYodaConditions);