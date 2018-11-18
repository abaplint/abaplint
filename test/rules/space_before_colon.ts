import {SpaceBeforeColon} from "../../src/rules/space_before_colon";
import {testRule} from "./_utils";

const tests = [
  {abap: "WRITE : 'foo'.", cnt: 1},
  {abap: "WRITE: 'foo'.", cnt: 0},
  {abap: ":WRITE 'foo'.", cnt: 0},
];

testRule(tests, "test space_before_colon rule", SpaceBeforeColon);