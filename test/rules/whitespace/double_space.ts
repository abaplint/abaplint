import {testRule} from "../_utils";
import {DoubleSpace} from "../../../src/rules";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE: / 'abc'.", cnt: 0},
  {abap: "IF  foo = bar.", cnt: 1},
  {abap: "IF foo = bar.", cnt: 0},
  {abap: "IF NOT  me->is_class_pool( me->program_name ) EQ abap_true.", cnt: 1},
  {abap: "call( var ).", cnt: 0},
  {abap: "call(  var ).", cnt: 1},
  {abap: "call( var  ).", cnt: 1},
  {abap: "call(  var  ).", cnt: 2},
];

testRule(tests, DoubleSpace);