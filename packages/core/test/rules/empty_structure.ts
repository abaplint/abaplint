import {EmptyStructure} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "CHECK foo = bar.", cnt: 0},
  {abap: "LOOP AT foobar.\nENDLOOP.", cnt: 1},
  {abap: "LOOP AT foobar.\nWRITE boo.\nENDLOOP.", cnt: 0},
  {abap: "IF foo = bar.\nENDIF.", cnt: 1},
  {abap: "WHILE foo = bar.\nENDWHILE.", cnt: 1},
  {abap: "CASE foo.\nENDCASE.", cnt: 1},

  {abap: `
TRY.
  CATCH cx_errror INTO something.
ENDTRY.`, cnt: 1},

  {abap: `
TRY.
    WRITE bar.
  CATCH cx_errror INTO something.
ENDTRY.`, cnt: 0},

];

testRule(tests, EmptyStructure);