import {testRule} from "./_utils";
import {NoAliases, NoAliasesConf} from "../../src/rules";

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
  {abap: `CLASS lcl_abc DEFINITION.
            PUBLIC SECTION.
              ALIASES: foo FOR bar,
                       moo FOR loo.
          ENDCLASS.`, cnt: 2},
  {abap: `INTERFACE lif_abc.
            ALIASES foo FOR bar.
          ENDINTERFACE.`, cnt: 1},
  {abap: `CLASS lcl_abc DEFINITION.
            PRIVATE SECTION.
              ALIASES foo FOR bar.
          ENDCLASS.`, cnt: 1},
];

testRule(tests, NoAliases);

const ignorePrivateConfig = new NoAliasesConf();
ignorePrivateConfig.ignorePrivate = true;

const ignorePrivateTests = [
  {abap: `CLASS lcl_abc DEFINITION.
            PRIVATE SECTION.
              ALIASES foo FOR bar.
          ENDCLASS.`, cnt: 0},
  {abap: `CLASS lcl_abc DEFINITION.
            PUBLIC SECTION.
              ALIASES foo FOR bar.
            PRIVATE SECTION.
              ALIASES moo FOR loo.
          ENDCLASS.`, cnt: 1},
];

testRule(ignorePrivateTests, NoAliases, ignorePrivateConfig, "test no_aliases rule, ignore private");
