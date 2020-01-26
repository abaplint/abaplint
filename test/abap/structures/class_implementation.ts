import {structureType} from "../_utils";
import {ClassImplementation} from "../../../src/abap/structures";

const cases = [
  {abap: "CLASS zfoo IMPLEMENTATION. ENDCLASS."},
  {abap: "CLASS zfoo IMPLEMENTATION. METHOD foo. ENDMETHOD. ENDCLASS."},
  {abap: "CLASS zfoo IMPLEMENTATION. METHOD foo. moo = boo. ENDMETHOD. ENDCLASS."},
  {abap: "CLASS zfoo IMPLEMENTATION. METHOD foo. TYPE-POOLS: abcd. ENDMETHOD. ENDCLASS."},
];

structureType(cases, new ClassImplementation());