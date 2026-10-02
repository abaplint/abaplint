import {PreferredParameterIgnored} from "../../src/rules/preferred_parameter_ignored";
import {testRule, testRuleFix} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE hello.", cnt: 0},

  // the defect: `val` is mandatory, so the addition does nothing
  {abap: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS meth
      IMPORTING
        val   TYPE string
        other TYPE i OPTIONAL
          PREFERRED PARAMETER val.
ENDCLASS.`, cnt: 1},
  {abap: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS meth
      IMPORTING
        val   TYPE string
        other TYPE i DEFAULT 1
          PREFERRED PARAMETER val.
ENDCLASS.`, cnt: 1},

  // the correct use, and the whole point of the addition
  {abap: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS meth
      IMPORTING
        val   TYPE string OPTIONAL
        other TYPE i OPTIONAL
          PREFERRED PARAMETER val.
ENDCLASS.`, cnt: 0},
  {abap: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS meth
      IMPORTING
        val   TYPE string DEFAULT 'a'
        other TYPE i DEFAULT 1
          PREFERRED PARAMETER val.
ENDCLASS.`, cnt: 0},

  // no addition at all: a mandatory parameter is not this rule's business
  {abap: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS meth
      IMPORTING
        val   TYPE string
        other TYPE i OPTIONAL.
ENDCLASS.`, cnt: 0},

  // RETURNING/EXPORTING next to it changes nothing
  {abap: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS meth
      IMPORTING
        val           TYPE string
        other         TYPE i OPTIONAL
          PREFERRED PARAMETER val
      RETURNING
        VALUE(result) TYPE i.
ENDCLASS.`, cnt: 1},
];

testRule(tests, PreferredParameterIgnored);

const fixes = [
  {
    // the addition goes, the mandatory parameter stays mandatory
    input: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS meth
      IMPORTING
        val   TYPE string
        other TYPE i OPTIONAL
          PREFERRED PARAMETER val.
ENDCLASS.`,
    output: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS meth
      IMPORTING
        val   TYPE string
        other TYPE i OPTIONAL
          .
ENDCLASS.`,
  },
];

testRuleFix(fixes, PreferredParameterIgnored);
