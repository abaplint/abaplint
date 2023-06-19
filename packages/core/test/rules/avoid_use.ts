import {AvoidUse} from "../../src/rules/avoid_use";
import {testRule, testRuleFix} from "./_utils";

const tests = [
  {abap: "WRITE: / 'abc'.", cnt: 0},
  {abap: "DEFINE _bar.", cnt: 1},
  {abap: "parser error", cnt: 0},
  // statics
  {abap: "STATICS foo TYPE i VALUE 10.", cnt: 1},
  {abap: `STATICS: BEGIN OF stat_foo,
                     foo TYPE i VALUE 10,
                     bar TYPE i VALUE 5,
                   END OF stat_foo.`, cnt: 1},

  // default key
  {abap: "TYPES: ty_table TYPE STANDARD TABLE OF usr02 WITH DEFAULT KEY.", cnt: 1},
  {abap: `TYPES: ty_table TYPE STANDARD TABLE OF usr02 WITH DEFAULT KEY. "comment`, cnt: 1},
  {abap: `TYPES: ty_table TYPE STANDARD TABLE OF usr02 WITH EMPTY KEY. "DEFAULT KEY`, cnt: 0},
  {abap: "TYPES: ty_table TYPE STANDARD TABLE OF usr02 WITH EMPTY KEY.", cnt: 0},
  {abap: "DATA: lt_foo TYPE STANDARD TABLE OF usr02 WITH DEFAULT KEY.", cnt: 1},
  {abap: "DATA: lt_foo TYPE STANDARD TABLE OF usr02 WITH EMPTY KEY.", cnt: 0},

  // break
  {abap: "break-point.", cnt: 1},
  {abap: "break user.", cnt: 1},
  {abap: "break-point id foo.", cnt: 0},

  // DESCRIBE LINES
  {abap: "DESCRIBE TABLE foo LINES bar.", cnt: 1, fix: true},
  {abap: "DESCRIBE TABLE foo-bar LINES bar.", cnt: 1, fix: true},
  {abap: "describe table foo-bar lines bar.", cnt: 1, fix: true},
  {abap: "bar = lines( foo ).", cnt: 0, fix: false},

  {abap: `TEST-SEAM authorization_seam. END-TEST-SEAM.`, cnt: 1},

  {abap: `EXPORT asdf TO MEMORY ID 'ZSDF'.`, cnt: 1},
  {abap: `EXPORT tab = tab TO DATABASE foo(tx) ID bar FROM moo.`, cnt: 1},
];

testRule(tests, AvoidUse);

const fixes = [
  {input: "DESCRIBE TABLE foo LINES bar.", output: "bar = lines( foo )."},
  {input: "DESCRIBE TABLE foo-bar LINES bar.", output: "bar = lines( foo-bar )."},
  {input: "describe table foo-bar lines bar.", output: "bar = lines( foo-bar )."},
];

testRuleFix(fixes, AvoidUse);
