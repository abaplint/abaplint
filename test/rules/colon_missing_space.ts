import {ColonMissingSpace} from "../../src/rules/whitespace/colon_missing_space";
import {testRule} from "./_utils";

const tests = [
  {abap: "WRITE:/ 'foobar'.", cnt: 1},
  {abap: "WRITE / 'foobar:'.", cnt: 0},
  {abap: "WRITE / 'foobar'.", cnt: 0},
];

testRule(tests, ColonMissingSpace);