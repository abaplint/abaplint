import {DbOperationInLoop} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "WRITE: / 'abc'.", cnt: 0},
  {abap: "parser error", cnt: 0},
  {abap: `DO 2 times.
    select * from bar into table @data(sdfds).
  enddo.`, cnt: 1},
  {abap: `WHILE 1 = 2.
    insert tab from table lt_tab.
  endwhile.`, cnt: 1},
];

testRule(tests, DbOperationInLoop);
