import {testRule} from "./_utils";
import {TypeFormParameters} from "../../src/rules";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "FORM foo.\nENDFORM.", cnt: 0},
  {abap: "FORM foo USING bar.\nENDFORM.", cnt: 1},
  {abap: "FORM foo USING bar TYPE string.\nENDFORM.", cnt: 0},
  {abap: "FORM foo CHANGING bar.\nENDFORM.", cnt: 1},
  {abap: "FORM foo CHANGING bar TYPE string.\nENDFORM.", cnt: 0},
];

testRule(tests, TypeFormParameters);