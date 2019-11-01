import {testRule} from "./_utils";
import {AbstractMethod} from "../../src/rules/abstract_method";

const tests = [
  {abap: `CLASS lcl_abc DEFINITION ABSTRACT.
            PUBLIC SECTION.
            METHODS:
              abstract_method ABSTRACT,
              normal_method.
          ENDCLASS.`, cnt: 0},
  {abap: `CLASS lcl_abc DEFINITION.
            PUBLIC SECTION.
              METHODS abstract_method ABSTRACT.
          ENDCLASS.`, cnt: 1},
  {abap: `CLASS lcl_abc DEFINITION.
            PUBLIC SECTION.
              METHODS:
                abstract_method ABSTRACT,
                normal_method,
                another_abstract_method ABSTRACT.
          ENDCLASS.`, cnt: 2},
  {abap: `CLASS lcl_abc DEFINITION.
            PUBLIC SECTION.
              METHODS:
                normal_method,
                foo_bar.
          ENDCLASS.`, cnt: 0},
];

testRule(tests, AbstractMethod);