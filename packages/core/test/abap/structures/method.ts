import {structureType} from "../_utils";
import {Method} from "../../../src/abap/3_structures/structures";

const cases = [
  {abap: `  METHOD get_lines.
  result = VALUE ztimem_line_t(
    FOR part IN parts
    FOR line IN part-lines
    ( line ) ).
ENDMETHOD.`},
];

structureType(cases, new Method());