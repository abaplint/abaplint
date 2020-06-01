import {testRule, testRuleFix} from "./_utils";
import {UseNew} from "../../src/rules";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "CREATE OBJECT foobar.", cnt: 1},
  {abap: "foobar = NEW #( ).", cnt: 0},
  {abap: "CREATE OBJECT ref TYPE ('ZCL_CLASS').", cnt: 0},
  {abap: `
CREATE OBJECT lo_source
  EXPORTING
    clskey             = is_clskey
  EXCEPTIONS
    class_not_existing = 1
    OTHERS             = 2.`, cnt: 0},
];

testRule(tests, UseNew);

const fixes = [
  {input: "CREATE OBJECT foobar.", output: "foobar = NEW #( )."},
  {input: "CREATE OBJECT ro_upload TYPE zcl_abapgit_ecatt_val_obj_upl.", output: "ro_upload = NEW zcl_abapgit_ecatt_val_obj_upl( )."},
  {input: "CREATE OBJECT foobar EXPORTING foo = bar.", output: "foobar = NEW #( foo = bar )."},
  {input: "CREATE OBJECT foobar EXPORTING foo = bar boo = moo.", output: "foobar = NEW #( foo = bar boo = moo )."},
];

testRuleFix(fixes, UseNew);