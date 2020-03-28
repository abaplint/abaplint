import {AmbiguousStatement} from "../../src/rules/ambiguous_statement";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "parser error.", cnt: 0},
  {abap: "DELETE foo FROM bar.", cnt: 1},
  {abap: "DELETE foo FROM @bar.", cnt: 0},
  {abap: "DELETE TABLE foo FROM bar.", cnt: 0},
  {abap: "DELETE lt_lengths FROM lv_nlen + 1.", cnt: 0},
  {abap: "MODIFY foo FROM bar.", cnt: 1},
  {abap: "MODIFY TABLE foo FROM bar.", cnt: 0},
  {abap: "MODIFY foo FROM @bar.", cnt: 0},
];

testRule(tests, AmbiguousStatement);