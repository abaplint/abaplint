import {ColonMissingSpace} from "../../src/rules/colon_missing_space";
import {testRule} from "./_utils";

const tests = [
  {abap: "WRITE:/ 'foobar'.", cnt: 1},
  {abap: "WRITE:hello, world.", cnt: 1},
  {abap: "WRITE: hello, world.", cnt: 0},
  {abap: "WRITE / 'foobar:'.", cnt: 0},
  {abap: "WRITE / 'foobar'.", cnt: 0},
  {abap: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    INTERFACES if_amdp_marker_hdb.
    CLASS-METHODS get_dummy FOR TABLE FUNCTION /test/abc.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD get_dummy BY DATABASE FUNCTION FOR HDB LANGUAGE SQLSCRIPT OPTIONS READ-ONLY.
    RETURN
      SELECT dummy FROM sys.dummy WHERE dummy = :var;
  ENDMETHOD.
ENDCLASS.`, cnt: 0},
];

testRule(tests, ColonMissingSpace);