import {EmptyLoop} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "CHECK foo = bar.", cnt: 0},
  {abap: "LOOP AT foobar.\nENDLOOP.", cnt: 1},
  {abap: "LOOP AT foobar.\nWRITE boo.\nENDLOOP.", cnt: 0},
];

testRule(tests, EmptyLoop);