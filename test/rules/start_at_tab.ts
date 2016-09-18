import {StartAtTab} from "../../src/rules/start_at_tab";
import {testRule} from "../utils";

let tests = [
  {abap: " WRITE 'foobar'.", cnt: 1},
  {abap: " WRITE 'foobar'.\n WRITE 'moo'.", cnt: 2},
  {abap: "WRITE 'foobar'.", cnt: 0},
];

testRule(tests, "test start_at_tab rule", StartAtTab);