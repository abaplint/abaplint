import {SpaceBeforeColon} from "../../src/rules/space_before_colon";
import {testRule} from "../utils";

let tests = [
  {abap: "WRITE : 'foo'.", cnt: 1},
  {abap: "WRITE: 'foo'.", cnt: 0},
  {abap: ":WRITE 'foo'.", cnt: 1},
];

testRule(tests, "test space_before_colon rule", SpaceBeforeColon);