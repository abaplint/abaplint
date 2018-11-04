import {EmptyStatement} from "../../src/rules/empty_statement";
import {testRule} from "./_utils";

let tests = [
  {abap: "types: foo type c.  .", cnt: 1},
  {abap: "WRITE: / 'abc'.", cnt: 0},
];

testRule(tests, "test empty_statement rule", EmptyStatement);