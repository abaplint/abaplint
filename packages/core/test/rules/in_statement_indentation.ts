import {testRule, testRuleFix} from "./_utils";
import {InStatementIndentation, InStatementIndentationConf} from "../../src/rules";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "parser\n    error", cnt: 0},
  {abap: "parser\n\n\nerror", cnt: 0},
  {abap: "WRITE: / 'abc'.", cnt: 0},
  {abap: "WRITE: /\n'abc'.", cnt: 1},
  {abap: "WRITE: /\n  'abc'.", cnt: 0},
  {abap: "IF foo = bar1\nAND moo = boo.", cnt: 1},
  {abap: "IF foo = bar2\n  AND moo = boo.", cnt: 1},
  {abap: "IF foo = bar3\n    AND moo = boo.", cnt: 0},
  {abap: `CLASS lcl_global_func DEFINITION.
  PUBLIC SECTION.
    INTERFACES if_amdp_marker_hdb.
    CLASS-METHODS get_dummy FOR TABLE FUNCTION /test/abc.
ENDCLASS.

CLASS lcl_global_func IMPLEMENTATION.
  METHOD get_dummy BY DATABASE FUNCTION FOR HDB LANGUAGE SQLSCRIPT OPTIONS READ-ONLY.
    RETURN
      SELECT dummy FROM "SYS".dummy WHERE dummy = :var;
  ENDMETHOD.
ENDCLASS.`, cnt: 0},
];

testRule(tests, InStatementIndentation);

const fixTests = [
  {
    input: "IF foo = bar\n  AND moo = loo.",
    output: "IF foo = bar\n    AND moo = loo.",
  },
];

testRuleFix(fixTests, InStatementIndentation);

const testsNoBlock = [
  {abap: "IF foo = baz1\nAND moo = boo.", cnt: 1},
  {abap: "IF foo = baz2\n  AND moo = boo.", cnt: 0},
  {abap: "IF foo = baz3\n    AND moo = boo.", cnt: 0}, // larger indent is allowed
];

const conf = new InStatementIndentationConf();
conf.blockStatements = 0;
testRule(testsNoBlock, InStatementIndentation, conf);
