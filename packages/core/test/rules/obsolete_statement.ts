import {ObsoleteStatement} from "../../src/rules/obsolete_statement";
import {testRule, testRuleFix} from "./_utils";

const tests = [
  {abap: "REFRESH lt_table.", cnt: 1, fix: true},
  {abap: "REFRESH foo FROM TABLE bar.", cnt: 1, fix: false},
  {abap: "COMPUTE lv_foo = 2 + 2.", cnt: 1},
  {abap: "SUBTRACT 2 FROM lv_foo.", cnt: 1},
  {abap: "MULTIPLY lv_foo BY 2.", cnt: 1},
  {abap: "DIVIDE lv_foo BY 2.", cnt: 1},
  {abap: "MOVE 2 TO lv_foo.", cnt: 1, fix: true},
  {abap: "MOVE for ?TO bar.", cnt: 1, fix: true},
  {abap: "MOVE EXACT is_status-installed_release TO lv_number.", cnt: 0, fix: false},
  {abap: "MOVE: LS_TFACS-JAHR TO LS_CAL-JAHR, LS_TFACS-MON01 TO LS_CAL-MON01.", cnt: 1, fix: false},
  {abap: "IF foo IS REQUESTED.", cnt: 1},
  {abap: "CLEAR lt_table.", cnt: 0},
  {abap: "lv_foo = 2 + 2.", cnt: 0},
  {abap: "lv_foo = lv_foo - 1.", cnt: 0},
  {abap: "lv_foo = lv_foo * 2.", cnt: 0},
  {abap: "lv_foo = lv_foo / 2.", cnt: 0},
  {abap: "lv_foo = 2.", cnt: 0},
  {abap: "IF foo IS SUPPLIED.", cnt: 0},

  {abap: "DATA tab LIKE foobar OCCURS 2.", cnt: 1},
  {abap: "RANGES moo FOR foo-bar OCCURS 50.", cnt: 2},
  {abap: "DESCRIBE TABLE tab OCCURS n1.", cnt: 1},
  {abap: `DATA: BEGIN OF li_order OCCURS 0,
  foo TYPE i,
END OF li_order.`, cnt: 1},

  {abap: "DATA tab TYPE STANDARD TABLE of foobar.", cnt: 0},
  {abap: "SET EXTENDED CHECK ON.", cnt: 1},
  {abap: "TYPE-POOLS bar.", cnt: 1},
  {abap: "CLASS class DEFINITION LOAD.", cnt: 1},
  {abap: "INTERFACE intf LOAD.", cnt: 1},
  {abap: "DATA tab TYPE STANDARD TABLE of string WITH HEADER LINE.", cnt: 1},
  {abap: "DATA tab TYPE STANDARD TABLE of string with header line.", cnt: 1},
  {abap: "FIELD-SYMBOLS <bar> STRUCTURE usr02 DEFAULT usr02.", cnt: 1},
  {abap: "PARAMETER foo TYPE c.", cnt: 1},
  {abap: "PARAMETERS foo TYPE c.", cnt: 0},
  {abap: "RANGES werks FOR sdfsdsd-werks.", cnt: 1},
  {abap: "DATA foo TYPE RANGE OF bar.", cnt: 0},
  {abap: "COMMUNICATION ACCEPT ID c.", cnt: 1},
  {abap: "PACK s TO d.", cnt: 1},

  // select without into
  {abap: "SELECT SINGLE * FROM t000.", cnt: 1},
  {abap: "SELECT SINGLE * FROM t000 INTO bar.", cnt: 0},
  {abap: `SELECT COUNT(*) FROM tcdrp WHERE object = mv_object.`, cnt: 0},
  {abap: `SELECT COUNT( * ) FROM dm40l WHERE dmoid = mv_data_model AND as4local = mv_activation_state.`, cnt: 0},

  {abap: "FREE MEMORY.", cnt: 1},
  {abap: "FREE MEMORY ID bar.", cnt: 0},
];

testRule(tests, ObsoleteStatement);

const fixes = [
  {input: "REFRESH foo.", output: "CLEAR foo."},
  {input: "MOVE foo TO bar.", output: "bar = foo."},
  {input: "MOVE foo ?TO bar.", output: "bar ?= foo."},
  {input: "MOVE struc-foo TO struc1-struc2-bar.", output: "struc1-struc2-bar = struc-foo."},
];

testRuleFix(fixes, ObsoleteStatement);
