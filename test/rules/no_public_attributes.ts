import {testRule} from "./_utils";
import {NoPublicAttributes, NoPublicAttributesConf} from "../../src/rules";

const tests = [
  {abap: `CLASS lcl_abc DEFINITION.
            PUBLIC SECTION.
            DATA counter TYPE i.
          ENDCLASS.`, cnt: 1},
  // case with READ-ONLY in line break
  {abap: `CLASS lcl_abc DEFINITION.
            PUBLIC SECTION.
            DATA counter TYPE i
                READ-ONLY.
            DATA abc TYPE i.
          ENDCLASS.`, cnt: 2},
  {abap: `CLASS lcl_abc DEFINITION.
            PUBLIC SECTION.
            DATA counter TYPE i READ-ONLY.
            DATA abc TYPE i
               READ-ONLY.
            DATA foo type i.
          ENDCLASS.`, cnt: 3},
  {abap: `CLASS lcl_abc DEFINITION.
            PUBLIC SECTION.
            PROTECTED SECTION.
            DATA counter TYPE i.
            DATA abc TYPE i.
          ENDCLASS.`, cnt: 0},
];

testRule(tests, NoPublicAttributes);

const testsReadOnlyAllowed = [
  {abap: `CLASS lcl_abc DEFINITION.
            PUBLIC SECTION.
                DATA counter TYPE i.
          ENDCLASS.`, cnt: 1},
  {abap: `CLASS lcl_abc DEFINITION.
            PUBLIC SECTION.
                DATA counter TYPE i
                    READ-ONLY.
                DATA abc TYPE i.
            PROTECTED SECTION.
                DATA foo TYPE i.
            PRIVATE SECTION.
                DATA oof TYPE i.
          ENDCLASS.`, cnt: 1},
  {abap: `CLASS lcl_abc DEFINITION.
            PUBLIC SECTION.
                DATA counter TYPE i READ-ONLY.
                DATA abc TYPE i
                    READ-ONLY.
                DATA foo type i.
          ENDCLASS.`, cnt: 1},
  {abap: `CLASS lcl_abc DEFINITION.
            PUBLIC SECTION.
            PROTECTED SECTION.
                DATA counter TYPE i.
            PRIVATE SECTION.
                DATA abc TYPE i.
          ENDCLASS.`, cnt: 0},
];


const configAllowReadOnly = new NoPublicAttributesConf();
configAllowReadOnly.allowReadOnly = true;

testRule(testsReadOnlyAllowed, NoPublicAttributes, configAllowReadOnly);