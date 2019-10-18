import {MethodLength, MethodLengthConf} from "../../src/rules/method_length";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE: / 'abc'.", cnt: 0},
  {abap: "METHOD foobar. ENDMETHOD.", cnt: 1},
  {abap: "METHOD foobar. WRITE foo. ENDMETHOD.", cnt: 0},

  {abap: `METHOD foobar.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  ENDMETHOD.`, cnt: 1},
];

testRule(tests, MethodLength);


const emptyMethodTests = [
  {abap: "METHOD foobar. ENDMETHOD.", cnt: 0},
];

const config = new MethodLengthConf();
config.errorWhenEmpty = false;

testRule(emptyMethodTests, MethodLength, config);
