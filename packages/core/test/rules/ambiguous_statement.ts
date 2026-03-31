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
  {abap: "MODIFY SCREEN FROM wa.", cnt: 0},
  {abap: `TABLES t100.
INSERT t100.
MODIFY t100.
DELETE t100.
UPDATE t100.`, cnt: 4},
  {abap: `DATA tab TYPE STANDARD TABLE OF i WITH HEADER LINE.
INSERT tab.
MODIFY tab.
DELETE tab.`, cnt: 3},
];

testRule(tests, AmbiguousStatement);