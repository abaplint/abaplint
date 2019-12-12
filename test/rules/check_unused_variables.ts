import {testRule} from "./_utils";
import {CheckUnusedVariables, CheckUnusedVariablesConf} from "../../src/rules/check_unused_variables";

const defaultConfigTests = [
  {
    abap: `
  CLASS lcl_abc DEFINITION.
    PUBLIC SECTION.
      METHODS foo.
  ENDCLASS.
  CLASS lcl_abc IMPLEMENTATION.
    METHOD foo.
      DATA lv_var TYPE i.
    ENDMETHOD.
  ENDCLASS.`,
    cnt: 1,
  },
  {
    abap: `
  CLASS lcl_abc DEFINITION.
    PUBLIC SECTION.
      METHODS foo.
  ENDCLASS.
  CLASS lcl_abc IMPLEMENTATION.
    METHOD foo.
      DATA lv_pragma TYPE i ##NEEDED.
      DATA lv_foo TYPE i.
      DATA lv_bar TYPE i.
      cl_abap_method( lv_bar ).
    ENDMETHOD.
  ENDCLASS.`,
    cnt: 1,
  },
  {
    abap: `
  CLASS lcl_abc DEFINITION.
    PUBLIC SECTION.
     METHODS foo.
  ENDCLASS.
  CLASS lcl_abc IMPLEMENTATION.
    METHOD foo.
      DATA lv_var TYPE i.
      cl_abap_method( lv_var ).
    ENDMETHOD.
  ENDCLASS.`,
    cnt: 0,
  },
  {
    abap: `
  CLASS lcl_abc DEFINITION.
    PUBLIC SECTION.
      METHODS foo.
  ENDCLASS.
  CLASS lcl_abc IMPLEMENTATION.
    METHOD foo.
      DATA: BEGIN OF lt_ab_ekpo,
        lv_ebeln TYPE ekpo-ebeln,
        lv_ebelp TYPE ekpo-ebelp,
      END OF lt_ab_ekpo.
    ENDMETHOD.
  ENDCLASS.`,
    cnt: 0,
  },
  {
    abap: `
  CLASS lcl_abc DEFINITION.
    PUBLIC SECTION.
      METHODS foo.
  ENDCLASS.
  CLASS lcl_abc IMPLEMENTATION.
    METHOD foo.
      CONSTANTS lc_con TYPE i value 1.
    ENDMETHOD.
  ENDCLASS.`,
    cnt: 1,
  },
  {
    abap: `
    CLASS lcl_abc DEFINITION.
      PUBLIC SECTION.
        METHODS foo.
    ENDCLASS.
    CLASS lcl_abc IMPLEMENTATION.
      METHOD foo.
        DATA lv_con TYPE i.
        lv_con = 1.
      ENDMETHOD.
    ENDCLASS.`,
    cnt: 1,
  },
];

const defaultConfig = new CheckUnusedVariablesConf();
testRule(defaultConfigTests, CheckUnusedVariables, defaultConfig);


const noConstantsCheckTests = [
  {
    abap: `
  CLASS lcl_abc DEFINITION.
    PUBLIC SECTION.
      METHODS foo.
  ENDCLASS.
  CLASS lcl_abc IMPLEMENTATION.
    METHOD foo.
      CONSTANTS lc_con TYPE i value 1.
    ENDMETHOD.
  ENDCLASS.
  `,
    cnt: 0,
  },
];

const noConstantsCheckConfig = new CheckUnusedVariablesConf();
noConstantsCheckConfig.checkConstants = false;
testRule(noConstantsCheckTests, CheckUnusedVariables, noConstantsCheckConfig);