import {ColonMissingSpace} from "../../src/rules/colon_missing_space";
import {testRule} from "./_utils";

let tests = [
  {abap: "WRITE:/ 'foobar'.", cnt: 1},
  {abap: "WRITE / 'foobar:'.", cnt: 0},
  {abap: "WRITE / 'foobar'.", cnt: 0},
];

testRule(tests, "test colon_missing_space rule", ColonMissingSpace);