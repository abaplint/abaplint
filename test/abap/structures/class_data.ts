import {structureType} from "../_utils";
import {ClassData} from "../../../src/abap/structures";

let cases = [
  {abap: "CLASS-DATA: BEGIN OF name, foo TYPE string, bar TYPE string, END OF name."},
];

structureType(cases, new ClassData());