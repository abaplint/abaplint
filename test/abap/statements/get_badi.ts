import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "GET BADI lo_foobar.",
  "GET BADI lo_foobar FILTERS foo = bar.",
  "GET BADI l_badi CONTEXT me.",
  "GET BADI r_badi TYPE (iv_name).",
  "GET BADI lo_badi TYPE (iv_badi_name) FILTERS foo = bar.",
];

statementType(tests, "GET BADI", Statements.GetBadi);