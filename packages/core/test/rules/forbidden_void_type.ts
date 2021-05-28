import {ForbiddenVoidType, ForbiddenVoidTypeConf} from "../../src/rules";
import {testRule, TestRuleType} from "./_utils";

const tests1 = [
  {abap: "parser error", cnt: 0},
  {abap: "CHECK foo = bar.", cnt: 0},
];

testRule(tests1, ForbiddenVoidType);

const tests2: TestRuleType = [
  {abap: "DATA forbidden_foo TYPE datum.", cnt: 1},
  {abap: "TYPES forbidden_foo TYPE datum.", cnt: 1},
  {abap: "DATA forbidden_foo TYPE d.", cnt: 0},
  {abap: `TYPES: BEGIN OF foo,
         component TYPE datum,
       END OF foo.`, cnt: 1},
  {abap: `NEW cl_abapgit_2fa_github_auth( ).`, cnt: 1},
  {abap: `cl_abapgit_2fa_github_auth=>bar( ).`, cnt: 1},
  {abap: `SELECT SINGLE * FROM table_someth INTO @DATA(bar).`, cnt: 1},
  {abap: `SELECT SINGLE * FROM zbar INTO @DATA(bar).`, cnt: 0}, // this will be unknown with the default errorNamespace
];

const config = new ForbiddenVoidTypeConf();
config.check = ["^datum$", "^cl_abapgit", "^table_someth$"];
testRule(tests2, ForbiddenVoidType, config);