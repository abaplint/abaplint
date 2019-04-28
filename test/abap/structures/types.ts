import {structureType} from "../_utils";
import {Types} from "../../../src/abap/structures";

const cases = [
  {abap: "TYPES: BEGIN OF ty_foo, raw TYPE xstring, compressed_len TYPE i, END OF ty_foo."},
  {abap: "TYPES:\n" +
    "BEGIN OF ty_result,\n" +
    "  ci_has_errors TYPE abap_bool,\n" +
    "  BEGIN OF statistics,\n" +
    "    finish_timestamp TYPE timestampl,\n" +
    "  END OF statistics,\n" +
    "END OF ty_result."},
];

structureType(cases, new Types());