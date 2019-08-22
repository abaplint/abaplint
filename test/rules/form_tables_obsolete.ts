import {testRule} from "./_utils";
import {FormTablesObsolete} from "../../src/rules";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "FORM foo.\nENDFORM.", cnt: 0},
  {abap: "FORM foo USING tables.\nENDFORM.", cnt: 0},
  {abap: "FORM foo TABLES bar.\nENDFORM.", cnt: 1},
];

testRule(tests, FormTablesObsolete);