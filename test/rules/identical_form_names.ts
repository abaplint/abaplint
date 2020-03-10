import {IdenticalFormNames} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "sdfsdfds.", cnt: 0},
  {abap: "FORM foobar.\nENDFORM.", cnt: 0},
  {abap: "FORM moo.\nENDFORM.\nFORM boo.\nENDFORM.", cnt: 0},
  {abap: "FORM abc.\nENDFORM.\nFORM ABC.\nENDFORM.", cnt: 1},
  /*
  {abap: `FORM foo-bar.
  ENDFORM.
  FORM foo-moo.
  ENDFORM.`, cnt: 0},
  */
];

testRule(tests, IdenticalFormNames);