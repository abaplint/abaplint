import {Version} from "../../src";
import {BooleanFlagViaIf} from "../../src/rules";
import {testRule, testRuleFix} from "./_utils";
import {IRedundantTest, inMethod, testSyntaxAfterFix, testVersions} from "./_redundant_code";

const flag = (declaration: string, body: string) => inMethod(declaration + "\nIF imp = 1.\n" + body + "\nENDIF.\ntext = f.");

const tests: IRedundantTest[] = [
  {abap: flag("DATA(f) = abap_false.", "  f = abap_true."), cnt: 1, fix: true},
  {abap: flag("DATA(f) = VALUE abap_bool( ).", "  f = abap_true."), cnt: 1, fix: true},
  {abap: flag("DATA(f) = space.", "  f = 'X'."), cnt: 1, fix: true},
  {abap: flag("DATA f TYPE abap_bool.", "  f = abap_true."), cnt: 1, fix: true},
  {abap: flag("DATA f TYPE c LENGTH 1.", "  f = abap_true."), cnt: 1, fix: true},
  {abap: inMethod("DATA(f) = abap_false.\nresult = 2.\nIF imp = 1 AND ( attr > 2 OR ref IS NOT BOUND ).\n  f = abap_true.\nENDIF.\ntext = f."), cnt: 1, fix: true},
  {abap: inMethod("DO 2 TIMES.\n  DATA(f) = abap_false.\n  IF imp = sy-index.\n    f = abap_true.\n  ENDIF.\n  text = f.\nENDDO."), cnt: 1, fix: true},
  {abap: inMethod("DATA(f) = abap_false.\nIF imp = 1.\n  f = abap_true.\nENDIF."), cnt: 1, fix: true},
  // generated code from abaplint-abap-classic
  {abap: inMethod(`    DATA(t433) = VALUE abap_bool( ).
    DATA(t434) = text.
    IF t434 IS INITIAL.
      t433 = abap_true.
    ENDIF.
    text = t433.`), cnt: 1, fix: true},

  // other branches or statements in the IF
  {abap: inMethod("DATA(f) = abap_false.\nIF imp = 1.\n  f = abap_true.\nELSE.\n  result = 1.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA(f) = abap_false.\nIF imp = 1.\n  f = abap_true.\nELSEIF imp = 2.\n  result = 1.\nENDIF."), cnt: 0},
  {abap: flag("DATA(f) = abap_false.", "  f = abap_true.\n  result = 1."), cnt: 0},
  {abap: flag("DATA(f) = abap_false.", "  \" found\n  f = abap_true."), cnt: 0},
  {abap: flag("DATA(f) = abap_false.", "  f = abap_true. \" found"), cnt: 0},
  // other values or writes
  {abap: flag("DATA(f) = abap_false.", "  f = abap_false."), cnt: 0},
  {abap: flag("DATA(f) = abap_true.", "  f = abap_true."), cnt: 0},
  {abap: flag("DATA f TYPE abap_bool VALUE abap_true.", "  f = abap_true."), cnt: 0},
  {abap: flag("DATA f TYPE abap_bool.\nCLEAR f.", "  f = abap_true."), cnt: 0},
  {abap: inMethod("DATA(f) = abap_false.\nIF imp = 1.\n  f = abap_true.\nENDIF.\nf = abap_false."), cnt: 0},
  {abap: inMethod("DATA(f) = abap_false.\nIF imp = 1.\n  f = abap_true.\nENDIF.\nGET REFERENCE OF f INTO DATA(r)."), cnt: 0},
  {abap: inMethod("DATA(f) = abap_false.\nIF imp = 1.\n  f = abap_true.\nENDIF.\nASSIGN f TO FIELD-SYMBOL(<f>)."), cnt: 0},
  {abap: inMethod("DATA(f) = abap_false.\nIF imp = 1.\n  f = abap_true.\nENDIF.\nPERFORM frm_flag USING f."), cnt: 0},
  // read before the IF, or in its condition
  {abap: inMethod("DATA(f) = abap_false.\ntext = f.\nIF imp = 1.\n  f = abap_true.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA(f) = abap_false.\nIF f IS INITIAL AND imp = 1.\n  f = abap_true.\nENDIF."), cnt: 0},
  // other block or loop
  {abap: inMethod("DATA(f) = abap_false.\nIF attr = 1.\n  IF imp = 1.\n    f = abap_true.\n  ENDIF.\nENDIF.\ntext = f."), cnt: 0},
  {abap: inMethod("DATA(f) = abap_false.\nDO 2 TIMES.\n  IF imp = sy-index.\n    f = abap_true.\n  ENDIF.\nENDDO.\ntext = f."), cnt: 0},
  {abap: inMethod("DO 2 TIMES.\n  DATA f TYPE abap_bool.\n  IF imp = sy-index.\n    f = abap_true.\n  ENDIF.\n  text = f.\nENDDO."), cnt: 0},
  // types
  {abap: flag("DATA f TYPE c LENGTH 2.", "  f = abap_true."), cnt: 0},
  {abap: inMethod("DATA(f) = 0.\nIF imp = 1.\n  f = 1.\nENDIF.\nresult = f."), cnt: 0},
  // not a local
  {abap: inMethod("IF imp = 1.\n  lif~flag = abap_true.\nENDIF."), cnt: 0},
  // dynamic code, macros, syntax errors
  {abap: flag("DATA(f) = abap_false.", "  f = abap_true.\n  ASSIGN ('ATTR') TO FIELD-SYMBOL(<fs>)."), cnt: 0},
  {abap: "DEFINE _set.\n  &1 = abap_true.\nEND-OF-DEFINITION.\n" + flag("DATA(f) = abap_false.", "  _set f."), cnt: 0},
  {abap: flag("DATA(f) = abap_false.", "  f = abap_true.\n  unknown = 1."), cnt: 0, syntaxError: true},
];

testRule(tests, BooleanFlagViaIf);
testSyntaxAfterFix(tests, BooleanFlagViaIf);

testRuleFix([
  {
    input: inMethod(`    DATA(f) = abap_false.
    IF imp = 1.
      f = abap_true.
    ENDIF.
    text = f.`),
    output: inMethod(`    DATA(f) = xsdbool( imp = 1 ).
    text = f.`),
  },
  {
    input: inMethod(`    DATA f TYPE abap_bool.
    IF imp = 1
        AND attr = 2.
      f = abap_true.
    ENDIF.
    text = f.`),
    output: inMethod(`    DATA f TYPE abap_bool.
    f = xsdbool( imp = 1
        AND attr = 2 ).
    text = f.`),
  },
], BooleanFlagViaIf);

testVersions(flag("DATA f TYPE abap_bool.", "  f = abap_true."), BooleanFlagViaIf, [
  {version: Version.v702, cnt: 0},
  {version: Version.v740sp05, cnt: 0},
  {version: Version.v740sp08, cnt: 1},
  {version: Version.OpenABAP, cnt: 1},
  {version: Version.Cloud, cnt: 1},
]);
