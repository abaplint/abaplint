import {testRule} from "./_utils";
import {CheckAbstract} from "../../src/rules/check_abstract";

const tests = [
  // test cases for abstract methods in non-abstract classes
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

  // test cases for final and abstract
  {abap: `CLASS lcl_abc DEFINITION ABSTRACT FINAL.
            PUBLIC SECTION.
              METHODS:
                normal_method.
          ENDCLASS.`, cnt: 1},
  {abap: `CLASS lcl_abc DEFINITION FINAL.
            PUBLIC SECTION.
              METHODS:
                normal_method.
          ENDCLASS.`, cnt: 0},
  {abap: `CLASS lcl_abc DEFINITION ABSTRACT.
            PUBLIC SECTION.
              METHODS:
                normal_method.
          ENDCLASS.`, cnt: 0},
  {abap: `CLASS lcl_abc DEFINITION ABSTRACT FINAL FOR TESTING.
          PUBLIC SECTION.
            METHODS:
              normal_method.
        ENDCLASS.`, cnt: 0},
];

testRule(tests, CheckAbstract);