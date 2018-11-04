import {MaxOneStatement} from "../../src/rules/max_one_statement";
import {testRule} from "./_utils";

let tests = [
  {abap: "WRITE 'hello'.  WRITE 'world'.  WRITE 'world'.", cnt: 1},
  {abap: "WRITE 'hello'.\nWRITE 'world'.\nWRITE 'world'.", cnt: 0},
];

testRule(tests, "test max_one_statement rule", MaxOneStatement);