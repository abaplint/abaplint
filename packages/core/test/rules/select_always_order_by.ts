import {SelectAlwaysOrderBy} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: `sdfdsf`, cnt: 0},
  {abap: `SELECT * from mara INTO table @data(foobar).`, cnt: 1},
  {abap: `SELECT * from mara INTO table @data(foobar) order by primary key.`, cnt: 0},
];

testRule(tests, SelectAlwaysOrderBy);
