import {structureType} from "../_utils";
import {Types} from "../../../src/abap/structures";

let cases = [
  {abap: "TYPES: BEGIN OF ty_foo, raw TYPE xstring, compressed_len TYPE i, END OF ty_foo."},
];

structureType(cases, new Types());