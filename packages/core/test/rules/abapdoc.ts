import {testRule} from "./_utils";
import {Abapdoc, AbapdocConf} from "../../src/rules/abapdoc";

const defaultConfigTests = [
  // all public methods have abapdoc
  {
    abap: ` CLASS zcl_foo DEFINITION PUBLIC.
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
            ENDCLASS.`, cnt: 0,
  },

  // one method is lacking abapdoc
  {
    abap: ` CLASS zcl_foo DEFINITION PUBLIC.
              PUBLIC SECTION.
              METHODS:
                "! doc
                "! doc
                foobar RETURNING VALUE(rv_string) TYPE string,
                moobar RETURNING VALUE(rv_string) TYPE string.
          ENDCLASS.`, cnt: 1,
  },

  // two methods are lacking abapdoc
  {
    abap: ` CLASS zcl_foo DEFINITION PUBLIC.
              PUBLIC SECTION.
                METHODS:
                  foobar RETURNING VALUE(rv_string) TYPE string,
                  moobar RETURNING VALUE(rv_string) TYPE string.
            ENDCLASS.`, cnt: 2,
  },

  // method-definitions without chaining, one is lacking abapdoc
  {
    abap: ` CLASS zcl_foo DEFINITION PUBLIC.
              PUBLIC SECTION.
                  METHODS foobar RETURNING VALUE(rv_string) TYPE string.
                  "! doc
                  METHODS moobar RETURNING VALUE(rv_string) TYPE string.
            ENDCLASS.`, cnt: 1,
  },

  // interface: two method definitions without abapdoc
  {
    abap: ` INTERFACE zif_foo PUBLIC.
              METHODS:
                 foobar RETURNING VALUE(rv_string) TYPE string,
                 moobar RETURNING VALUE(rv_string) TYPE string.
            ENDINTERFACE.`, cnt: 2,
  },

  // interface: all methods have abapdoc
  {
    abap: ` INTERFACE zif_foo PUBLIC.
              METHODS:
                 "! doc
                 foobar RETURNING VALUE(rv_string) TYPE string,
                 "! doc
                 moobar RETURNING VALUE(rv_string) TYPE string.
            ENDINTERFACE.`, cnt: 0,
  },

  // local interface: no check with default config
  {
    abap: ` INTERFACE zif_foo.
              METHODS:
                 foobar RETURNING VALUE(rv_string) TYPE string,
                 moobar RETURNING VALUE(rv_string) TYPE string.
            ENDINTERFACE.`, cnt: 0,
  },

  // local class: no check with default config
  {
    abap: ` CLASS lcl_foo DEFINITION.
              PUBLIC SECTION.
                METHODS:
                  foobar RETURNING VALUE(rv_string) TYPE string,
                  moobar RETURNING VALUE(rv_string) TYPE string.
              PROTECTED SECTION.
                METHODS:
                  coobar RETURNING VALUE(rv_string) TYPE string,
                  doobar RETURNING VALUE(rv_string) TYPE string.
            ENDCLASS.`, cnt: 0,
  },
  {
    abap: ` CLASS zcl_foo DEFINITION PUBLIC.
              PUBLIC SECTION.
                METHODS:
                  foobar REDEFINITION,
                  moo.
            ENDCLASS.`, cnt: 1,
  },
  {
    abap: ` CLASS zcl_foo DEFINITION PUBLIC.
              PUBLIC SECTION.
                METHODS:
                  foobar REDEFINITION
            ENDCLASS.`, cnt: 0,
  },
];

testRule(defaultConfigTests, Abapdoc);


const localCheckActiveTests = [
  // local class, check active, missing abapdoc
  {
    abap: ` CLASS lcl_foo_local DEFINITION.
              PUBLIC SECTION.
                METHODS:
                  foobar_loc RETURNING VALUE(rv_string) TYPE string,
                  moobar_loc RETURNING VALUE(rv_string) TYPE string.
              PROTECTED SECTION.
                METHODS:
                  coobar RETURNING VALUE(rv_string) TYPE string,
                  doobar RETURNING VALUE(rv_string) TYPE string.
            ENDCLASS.`, cnt: 2,
  },

  // local class, check active, required abapdoc provided
  {
    abap: ` CLASS zcl_foo_local DEFINITION PUBLIC.
              PUBLIC SECTION.
              METHODS:
                "! doc
                foobar RETURNING VALUE(rv_string) TYPE string,
                "! doc
                moobar RETURNING VALUE(rv_string) TYPE string.
          ENDCLASS.`, cnt: 0,
  },

];

const localCheckConfig = new AbapdocConf();
localCheckConfig.checkLocal = true;

testRule(localCheckActiveTests, Abapdoc, localCheckConfig);