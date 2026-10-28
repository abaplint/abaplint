import {Version} from "../../src";
import {CastViaGenericReference} from "../../src/rules";
import {testRule, testRuleFix} from "./_utils";
import {IRedundantTest, inMethod, testSyntaxAfterFix, testVersions} from "./_redundant_code";

const other = "CLASS lother DEFINITION.\nENDCLASS.\nCLASS lother IMPLEMENTATION.\nENDCLASS.\n";

const tests: IRedundantTest[] = [
  {abap: inMethod(`    DATA t46 TYPE REF TO lsub.
    DATA t49 TYPE REF TO object.
    t49 = iref.
    TRY.
        t46 ?= t49.
      CATCH cx_sy_move_cast_error.
    ENDTRY.
    ref = t46.`), cnt: 1, fix: true},
  {abap: inMethod("DATA o TYPE REF TO object.\no = me->ref.\nDATA s TYPE REF TO lsub.\ns ?= o."), cnt: 1, fix: true},
  {abap: inMethod("DATA o TYPE REF TO object.\no = iref.\nIF val = 1.\n  DATA s TYPE REF TO lsub.\n  s ?= o.\nENDIF."), cnt: 1, fix: true},
  {abap: inMethod("DO 2 TIMES.\n  DATA o TYPE REF TO object.\n  o = iref.\n  DATA s TYPE REF TO lsub.\n  s ?= o.\nENDDO."), cnt: 1, fix: true},
  // o typed with a supertype of r
  {abap: inMethod("DATA r TYPE REF TO lsub.\nr = NEW #( ).\nDATA o TYPE REF TO lcl.\no = r.\nDATA s TYPE REF TO lsub.\ns ?= o."), cnt: 1, fix: true},
  {abap: inMethod("DATA o TYPE REF TO lif.\no = iref.\nDATA s TYPE REF TO lsub.\ns ?= o."), cnt: 1, fix: true},
  // the cast stays valid: an interface or REF TO object on either side, or the same inheritance line
  {abap: inMethod("DATA o TYPE REF TO object.\no = iref.\nDATA i TYPE REF TO lif.\ni ?= o."), cnt: 1, fix: true},
  {abap: inMethod("DATA o TYPE REF TO object.\no = iref.\nDATA x TYPE REF TO object.\nx ?= o."), cnt: 1, fix: true},
  {abap: inMethod("DATA r TYPE REF TO lsub.\nr = NEW #( ).\nDATA o TYPE REF TO object.\no = r.\nref ?= o."), cnt: 1, fix: true},
  {abap: other + inMethod("DATA o TYPE REF TO object.\no = iref.\nDATA x TYPE REF TO lother.\nx ?= o."), cnt: 0},
  {abap: other + inMethod("DATA r TYPE REF TO lif.\nDATA o TYPE REF TO object.\no = r.\nDATA x TYPE REF TO lother.\nx ?= o."), cnt: 1, fix: true},

  // other references to o
  {abap: inMethod("DATA o TYPE REF TO object.\no = iref.\nDATA s TYPE REF TO lsub.\ns ?= o.\nref ?= o."), cnt: 0},
  {abap: inMethod("DATA o TYPE REF TO object.\no = iref.\no = ref.\nDATA s TYPE REF TO lsub.\ns ?= o."), cnt: 0},
  {abap: inMethod("DATA o TYPE REF TO object.\no = iref.\nCLEAR o.\nDATA s TYPE REF TO lsub.\ns ?= o."), cnt: 0},
  {abap: inMethod("DATA o TYPE REF TO object.\no = iref.\nGET REFERENCE OF o INTO DATA(r).\nDATA s TYPE REF TO lsub.\ns ?= o."), cnt: 0},
  // r changes in between
  {abap: inMethod("DATA o TYPE REF TO object.\no = ref.\nref = NEW #( ).\nDATA s TYPE REF TO lsub.\ns ?= o."), cnt: 0},
  {abap: inMethod("DATA o TYPE REF TO object.\no = ref.\nput( ).\nDATA s TYPE REF TO lsub.\ns ?= o."), cnt: 0},
  {abap: inMethod("DATA r TYPE REF TO lcl.\nr = NEW #( ).\nDATA o TYPE REF TO object.\no = r.\nput( ).\nDATA s TYPE REF TO lsub.\ns ?= o."), cnt: 1, fix: true},
  {abap: inMethod("DATA r TYPE REF TO lcl.\nDATA o TYPE REF TO object.\no = r.\nr = NEW #( ).\nDATA s TYPE REF TO lsub.\ns ?= o."), cnt: 0},
  // r is not a plain object reference
  {abap: inMethod("DATA o TYPE REF TO object.\no = obj( ).\nDATA s TYPE REF TO lsub.\ns ?= o."), cnt: 0},
  {abap: inMethod("DATA o TYPE REF TO object.\no = NEW lsub( ).\nDATA s TYPE REF TO lsub.\ns ?= o."), cnt: 0},
  // other shapes of the read and the write
  {abap: inMethod("DATA o TYPE REF TO object.\no = iref.\nDATA x TYPE REF TO object.\nx = o."), cnt: 0},
  {abap: inMethod("DATA o TYPE REF TO object.\no = iref.\nDATA(s) = CAST lsub( o ).\nref = s."), cnt: 0},
  {abap: inMethod("DATA o TYPE REF TO object.\no = iref.\nDATA(x) ?= o.\nref ?= x."), cnt: 0},
  {abap: inMethod("DATA o TYPE REF TO object.\nDATA o2 TYPE REF TO object.\no2 = iref.\no ?= o2.\nDATA s TYPE REF TO lsub.\ns ?= o."), cnt: 1, fix: true},
  {abap: inMethod("DATA(o) = CAST object( iref ).\nDATA s TYPE REF TO lsub.\ns ?= o."), cnt: 0},
  {abap: inMethod("DATA: o TYPE REF TO object,\n      s TYPE REF TO lsub.\no = iref.\ns ?= o."), cnt: 0},
  // not executed before the read on every path, or in another loop
  {abap: inMethod("DATA o TYPE REF TO object.\nIF val = 1.\n  o = iref.\nENDIF.\nDATA s TYPE REF TO lsub.\ns ?= o."), cnt: 0},
  {abap: inMethod("DATA o TYPE REF TO object.\no = iref.\nDATA s TYPE REF TO lsub.\nDO 2 TIMES.\n  s ?= o.\nENDDO."), cnt: 0},
  // dynamic code, macros, syntax errors
  {abap: inMethod("DATA o TYPE REF TO object.\no = iref.\nDATA s TYPE REF TO lsub.\ns ?= o.\nASSIGN ('ATTR') TO FIELD-SYMBOL(<fs>)."), cnt: 0},
  {abap: "DEFINE _cast.\n  ref ?= &1.\nEND-OF-DEFINITION.\n" + inMethod("DATA o TYPE REF TO object.\no = iref.\n_cast o."), cnt: 0},
  {abap: inMethod("DATA o TYPE REF TO object.\no = iref.\nDATA s TYPE REF TO lsub.\ns ?= o.\nunknown = 1."), cnt: 0, syntaxError: true},
];

testRule(tests, CastViaGenericReference);
testSyntaxAfterFix(tests, CastViaGenericReference);

testRuleFix([
  {
    input: inMethod(`    DATA t46 TYPE REF TO lsub.
    DATA t49 TYPE REF TO object.
    t49 = iref.
    TRY.
        t46 ?= t49.
      CATCH cx_sy_move_cast_error.
    ENDTRY.`),
    output: inMethod(`    DATA t46 TYPE REF TO lsub.
    TRY.
        t46 ?= iref.
      CATCH cx_sy_move_cast_error.
    ENDTRY.`),
  },
  {
    input: inMethod(`    DATA o TYPE REF TO object.
    o = me->ref.
    IF val = 1.
      DATA s TYPE REF TO lsub.
      s ?= o.
    ENDIF.`),
    output: inMethod(`    IF val = 1.
      DATA s TYPE REF TO lsub.
      s ?= me->ref.
    ENDIF.`),
  },
], CastViaGenericReference);

testVersions(inMethod("DATA o TYPE REF TO object.\no = iref.\nDATA s TYPE REF TO lsub.\ns ?= o."), CastViaGenericReference, [
  {version: Version.v702, cnt: 1},
  {version: Version.Cloud, cnt: 1},
]);
