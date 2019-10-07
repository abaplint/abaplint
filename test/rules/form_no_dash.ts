import {FormNoDash} from "../../src/rules/form_no_dash";
import {testRule} from "./_utils";


const tests = [
  {abap: "FORM foobar.\nENDFORM.", cnt: 0},
  {abap: "FORM foo-bar-bar.\nENDFORM.", cnt: 1},
  {abap: "FORM foo-.\nENDFORM.", cnt: 1},
  {abap: "jasdhasdf", cnt: 0},
];

testRule(tests, FormNoDash);