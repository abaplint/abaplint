import {StartAtTab} from "../../src/rules/start_at_tab";
import {testRule} from "./_utils";

const tests = [
  {abap: " WRITE 'foobar'.", cnt: 1},
  {abap: " WRITE 'foobar'.\n WRITE 'moo'.", cnt: 2},
  {abap: "WRITE 'foobar'.", cnt: 0},
  {abap: " \"sdf", cnt: 0},
  {abap: "moo = boo.  \"sdf", cnt: 0},
  {abap: "TYPES: BEGIN OF ty_file.\n         INCLUDE TYPE ty_file_signature.\n" +
         "TYPES:   data     TYPE xstring,\n       END OF ty_file.", cnt: 0},
];

testRule(tests, "test start_at_tab rule", StartAtTab);