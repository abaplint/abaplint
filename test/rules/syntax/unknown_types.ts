import {testRule} from "../_utils";
import {UnknownTypes} from "../../../src/rules";

// note that the errorNamespace is respected

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "parser error.", cnt: 0},
  {abap: "WRITE hello.", cnt: 0},
  {abap: "DATA foo TYPE zint4.", cnt: 1},
  {abap: "DATA foo TYPE foomoo.", cnt: 0},
];

testRule(tests, UnknownTypes);