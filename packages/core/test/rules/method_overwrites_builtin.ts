import {MethodOverwritesBuiltIn} from "../../src/rules/method_overwrites_builtin";
import {testRule} from "./_utils";

const tests = [
  {abap: `CLASS lcl_abc DEFINITION.
            PUBLIC SECTION.
              METHODS line_exists.
          ENDCLASS.`, cnt: 1},
  {abap: `CLASS lcl_abc DEFINITION.
            PUBLIC SECTION.
              METHODS to_upper.
          ENDCLASS.`, cnt: 1},
  {abap: `CLASS lcl_abc DEFINITION.
          PUBLIC SECTION.
            METHODS to_uppercase.
        ENDCLASS.`, cnt: 0},
  {abap: `INTERFACE lif_foo.
            METHODS xsdbool.
          ENDINTERFACE.`, cnt: 1},
];

testRule(tests, MethodOverwritesBuiltIn);