import {structureType} from "../../utils";
import {ClassImplementation} from "../../../src/abap/structures";

let cases = [
  {abap: "CLASS zfoo IMPLEMENTATION. ENDCLASS."},
  {abap: "CLASS zfoo IMPLEMENTATION. METHOD foo. ENDMETHOD. ENDCLASS."},
  {abap: "CLASS zfoo IMPLEMENTATION. METHOD foo. moo = boo. ENDMETHOD. ENDCLASS."},
];

structureType(cases, new ClassImplementation());