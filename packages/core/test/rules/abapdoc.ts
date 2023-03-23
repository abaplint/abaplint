import { testRule } from "./_utils";
import { Abapdoc, AbapdocConf } from "../../src/rules/abapdoc";

const defaultConfigTests = [
  // all public methods have abapdoc
  {
    abap: `
    "! hello
    CLASS zcl_foo DEFINITION PUBLIC.
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
    abap: `
    "! hello
    CLASS zcl_foo DEFINITION PUBLIC.
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
    abap: `
    "! hello
    CLASS zcl_foo DEFINITION PUBLIC.
              PUBLIC SECTION.
                METHODS:
                  foobar RETURNING VALUE(rv_string) TYPE string,
                  moobar RETURNING VALUE(rv_string) TYPE string.
            ENDCLASS.`, cnt: 2,
  },

  // method-definitions without chaining, one is lacking abapdoc
  {
    abap: `
    "! hello
    CLASS zcl_foo DEFINITION PUBLIC.
              PUBLIC SECTION.
                  METHODS foobar RETURNING VALUE(rv_string) TYPE string.
                  "! doc
                  METHODS moobar RETURNING VALUE(rv_string) TYPE string.
            ENDCLASS.`, cnt: 1,
  },

  // interface: two method definitions without abapdoc
  {
    abap: `
    "! hello
    INTERFACE zif_foo PUBLIC.
              METHODS:
                 foobar RETURNING VALUE(rv_string) TYPE string,
                 moobar RETURNING VALUE(rv_string) TYPE string.
            ENDINTERFACE.`, cnt: 2,
  },

  // interface: all methods have abapdoc
  {
    abap: `
    "! hello
    INTERFACE zif_foo PUBLIC.
              METHODS:
                 "! doc
                 foobar RETURNING VALUE(rv_string) TYPE string,
                 "! doc
                 moobar RETURNING VALUE(rv_string) TYPE string.
            ENDINTERFACE.`, cnt: 0,
  },

  // local interface: no check with default config
  {
    abap: `
    "! hello
    INTERFACE zif_foo.
              METHODS:
                 foobar RETURNING VALUE(rv_string) TYPE string,
                 moobar RETURNING VALUE(rv_string) TYPE string.
            ENDINTERFACE.`, cnt: 0,
  },

  // local class: no check with default config
  {
    abap: `
    "! hello
    CLASS lcl_foo DEFINITION.
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
    abap: ` "! hello
    CLASS zcl_foo DEFINITION PUBLIC.
              PUBLIC SECTION.
                METHODS:
                  foobar REDEFINITION,
                  moo.
            ENDCLASS.`, cnt: 1,
  },
  {
    abap: ` "! hello
    CLASS zcl_foo DEFINITION PUBLIC.
              PUBLIC SECTION.
                METHODS:
                  foobar REDEFINITION
            ENDCLASS.`, cnt: 0,
  },
  {
    abap: `INTERFACE if_test PUBLIC.
  "! <p class="shorttext synchronized" lang="en">Text</p>
  METHODS
    calculate RAISING cx_test.
ENDINTERFACE.`, cnt: 0,
  },
  {
    abap: `
INTERFACE if_test PUBLIC.
  "! <p class="shorttext synchronized" lang="en"></p>
  METHODS
    calculate RAISING cx_test.
ENDINTERFACE.`, cnt: 1,
  },
  {
    abap: `
INTERFACE if_test PUBLIC.
    "! <p class="shorttext synchronized" lang="en"></p>
    "!
    "! @parameter input | <p class="shorttext synchronized" lang="en"></p>
    METHODS
    calculate RAISING cx_test.
ENDINTERFACE.`, cnt: 2,
  },
  {
    abap: `
INTERFACE if_test PUBLIC.
"! <p class="shorttext synchronized" lang="en"></p>
"!
"! @parameter input | <p class="shorttext synchronized" lang="en"></p>
"! @parameter result | <p class="shorttext synchronized" lang="en"></p>

    METHODS
    calculate RAISING cx_test.
ENDINTERFACE.`, cnt: 1,
  },
  {
    abap: `
INTERFACE if_test PUBLIC.
"! <p class="shorttext synchronized" lang="en"></p>
"!
"! @parameter | <p class="shorttext synchronized" lang="en"></p>
"! <p class="shorttext synchronized" lang="en">Parameter 2</p>
    METHODS
    calculate RAISING cx_test.
ENDINTERFACE.`, cnt: 2,
  },
];

testRule(defaultConfigTests, Abapdoc);


const localCheckActiveTests = [
  // local class, check active, missing abapdoc
  {
    abap: `"! hello
    CLASS lcl_foo_local DEFINITION.
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
    abap: `"! hello
    CLASS zcl_foo_local DEFINITION PUBLIC.
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
localCheckConfig.classDefinition = false;

testRule(localCheckActiveTests, Abapdoc, localCheckConfig);