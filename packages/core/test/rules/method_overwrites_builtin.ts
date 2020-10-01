import {MethodOverwritesBuiltIn} from "../../src/rules/method_overwrites_builtin";
import {testRule} from "./_utils";

const tests = [
  {abap: `CLASS lcl_abc DEFINITION.
            PUBLIC SECTION.
              METHOD line_exists.
          ENDCLASS.`, cnt: 1},
  {abap: `CLASS lcl_abc DEFINITION.
            PUBLIC SECTION.
              METHOD to_upper.
          ENDCLASS.`, cnt: 1},
  {abap: `CLASS lcl_abc DEFINITION.
          PUBLIC SECTION.
            METHOD to_uppercase.
        ENDCLASS.`, cnt: 0},
  {abap: `INTERFACE lif_foo DEFINITION.
            METHOD xsdbool.
          ENDCLASS.`, cnt: 1},
];

testRule(tests, MethodOverwritesBuiltIn);