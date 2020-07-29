import {structureType} from "../_utils";
import {Data} from "../../../src/abap/3_structures/structures";

const cases = [
  {abap: "DATA: BEGIN OF name, foo TYPE string, bar TYPE string, END OF name."},

  {abap: `
  DATA: BEGIN OF COMMON PART sddfs.
  DATA: foo TYPE c LENGTH 1.
  ENHANCEMENT-POINT sdf SPOTS sdfsdf STATIC INCLUDE BOUND.
  DATA: END OF COMMON PART.`},

  {abap: `
  DATA: BEGIN OF COMMON PART something.
  TYPE-POOLS zfsd.
  DATA: END OF COMMON PART something.`},

  {abap: `
  DATA: BEGIN OF COMMON PART asdf.
  ENHANCEMENT 1  sdfsd.
  ENDENHANCEMENT.
  DATA: END OF COMMON PART.`},

];

structureType(cases, new Data());