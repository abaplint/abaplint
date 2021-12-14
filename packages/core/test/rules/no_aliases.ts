import {testRule} from "./_utils";
import {NoAliases} from "../../src/rules";

const tests = [
  {abap: `CLASS lcl_abc DEFINITION.
            PUBLIC SECTION.
              DATA counter TYPE i.
          ENDCLASS.`, cnt: 0},
  {abap: `parser error`, cnt: 0},
  {abap: `CLASS lcl_abc DEFINITION.
            PUBLIC SECTION.
              ALIASES foo FOR bar.
          ENDCLASS.`, cnt: 1},
];

testRule(tests, NoAliases);