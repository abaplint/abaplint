import {structureType} from "../_utils";
import {TypeEnum} from "../../../src/abap/structures";

let cases = [
  {abap: "TYPES BEGIN OF ENUM name STRUCTURE name2 BASE TYPE char01.\n" +
  "TYPES foo VALUE IS INITIAL.\n" +
  "TYPES bar VALUE '1'.\n" +
  "TYPES END OF ENUM name STRUCTURE name2.\n"},
];

structureType(cases, new TypeEnum());