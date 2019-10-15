import {testRule} from "./_utils";
import {Abapdoc} from "../../src/rules/abapdoc";


const tests = [
  // all public methods have abapdoc
  { abap: ` CLASS zcl_foo DEFINITION.
              PUBLIC SECTION.
                METHODS:
                  "! doc
                  "! doc
                  foobar RETURNING VALUE(rv_string) TYPE string,
                  "! doc
                  moobar RETURNING VALUE(rv_string) TYPE string.
              PROTECTED SECTION.
                METHODS:
                  coobar RETURNING VALUE(rv_string) TYPE string,
                  doobar RETURNING VALUE(rv_string) TYPE string.
            ENDCLASS.`, cnt: 0},

  // one method is lacking abapdoc
  { abap: ` CLASS zcl_foo DEFINITION.
              PUBLIC SECTION.
              METHODS:
                "! doc
                "! doc
                foobar RETURNING VALUE(rv_string) TYPE string,
                moobar RETURNING VALUE(rv_string) TYPE string.
          ENDCLASS.`, cnt: 1},

  // two methods are lacking abapdoc
  { abap: ` CLASS zcl_foo DEFINITION.
              PUBLIC SECTION.
                METHODS:
                  foobar RETURNING VALUE(rv_string) TYPE string,
                  moobar RETURNING VALUE(rv_string) TYPE string.
            ENDCLASS.`, cnt: 2},

  // method-definitions without chaining, one is lacking abapdoc
  { abap: ` CLASS zcl_foo DEFINITION.
              PUBLIC SECTION.
                  METHODS foobar RETURNING VALUE(rv_string) TYPE string.
                  "! doc
                  METHODS moobar RETURNING VALUE(rv_string) TYPE string.
            ENDCLASS.`, cnt: 1},

  // interface: two method definitions without abapdoc
  { abap: ` INTERFACE zif_foo.
              METHODS:
                 foobar RETURNING VALUE(rv_string) TYPE string,
                 moobar RETURNING VALUE(rv_string) TYPE string.
            ENDINTERFACE.`, cnt: 2},

  // interface: all methods have abapdoc
  { abap: ` INTERFACE zif_foo.
              METHODS:
                 "! doc
                 foobar RETURNING VALUE(rv_string) TYPE string,
                 "! doc
                 moobar RETURNING VALUE(rv_string) TYPE string.
            ENDINTERFACE.`, cnt: 0},
];

testRule(tests, Abapdoc);