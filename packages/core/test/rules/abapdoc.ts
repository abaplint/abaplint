import {testRule} from "./_utils";
import {Abapdoc, AbapdocConf} from "../../src/rules/abapdoc";

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
  {
    abap: `
INTERFACE if_test PUBLIC.
"! <p class="shorttext synchronized" lang="en"></p>
"!
"! @parameter parameters | parameters structure:<ul><li></li></ul>
    METHODS
    calculate RAISING cx_test.
ENDINTERFACE.`, cnt: 2,
  },
  {
    abap: `
INTERFACE if_test PUBLIC.
"! <p class="shorttext synchronized" lang="en">Test</p>
"!
"! @parameter parameters | parameters structure:<ul><li>test param 1</li></ul>
    METHODS
    calculate RAISING cx_test.
ENDINTERFACE.`, cnt: 0,
  },
  // glocal class for testing: don't check any with default
  {
    abap: `
    CLASS zcl_foo DEFINITION PUBLIC FOR TESTING.
      PUBLIC SECTION.
        METHODS:
          foobar FOR TESTING,
          moobar FOR TESTING.
    ENDCLASS.`, cnt: 0,
  },
  // glocal class for testing: don't check any with default
  {
    abap: `
    "! docu
    CLASS zcl_foo DEFINITION PUBLIC FOR TESTING.
      PUBLIC SECTION.
        METHODS:
          "! docu
          foobar FOR TESTING,
          moobar FOR TESTING.
    ENDCLASS.`, cnt: 0,
  },
  // glocal class for testing: don't check any with default
  {
    abap: `
    CLASS zcl_foo DEFINITION PUBLIC FOR TESTING.
      PUBLIC SECTION.
        METHODS:
          "! docu
          foobar FOR TESTING,
          "! docu
          moobar FOR TESTING.
    ENDCLASS.`, cnt: 0,
  },
  // glocal class for testing: don't check any with default
  {
    abap: `
    "! docu
    CLASS zcl_foo DEFINITION PUBLIC FOR TESTING.
      PUBLIC SECTION.
        METHODS:
          "! docu
          foobar FOR TESTING,
          "! docu
          moobar FOR TESTING.
    ENDCLASS.`, cnt: 0,
  },
];

testRule(defaultConfigTests, Abapdoc, undefined, `rule: abapdoc`);


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

testRule(localCheckActiveTests, Abapdoc, localCheckConfig, `rule: abapdoc, localCheckActive`);

const ignoreTestMethodsInactiveTests = [
  {
    // global class for testing: check only methods, two missing
    abap: `
    CLASS zcl_foo DEFINITION PUBLIC FOR TESTING.
      PUBLIC SECTION.
        METHODS:
          foobar FOR TESTING,
          moobar FOR TESTING.
    ENDCLASS.`, cnt: 2,
  },
  {
    // global class for testing: check only methods, class missing okay
    abap: `
    CLASS zcl_foo DEFINITION PUBLIC FOR TESTING.
      PUBLIC SECTION.
        METHODS:
          "! docu
          foobar FOR TESTING,
          "! docu
          moobar FOR TESTING.
    ENDCLASS.`, cnt: 0,
  },
];

const ignoreTestMethodsConfig = new AbapdocConf();
ignoreTestMethodsConfig.ignoreTestClasses = false;

testRule(ignoreTestMethodsInactiveTests, Abapdoc, ignoreTestMethodsConfig, `rule: abapdoc, ignoreTestMethodsInactive`);

const ignoreTestClassesInactiveTests = [
  {
    // global class for testing: check all, three missing
    abap: `
    CLASS zcl_foo DEFINITION PUBLIC FOR TESTING.
      PUBLIC SECTION.
        METHODS:
          foobar FOR TESTING,
          moobar FOR TESTING.
    ENDCLASS.`, cnt: 3,
  },
  {
    // global class for testing: check all, class missing error
    abap: `
    CLASS zcl_foo DEFINITION PUBLIC FOR TESTING.
      PUBLIC SECTION.
        METHODS:
          "! docu
          foobar FOR TESTING,
          "! docu
          moobar FOR TESTING.
    ENDCLASS.`, cnt: 1,
  },
];

const ignoreTestClassesConfig = new AbapdocConf();
ignoreTestClassesConfig.ignoreTestClasses = false;
ignoreTestClassesConfig.classDefinition = true;

testRule(ignoreTestClassesInactiveTests, Abapdoc, ignoreTestClassesConfig, `rule: abapdoc, ignoreTestClassesInactive`);