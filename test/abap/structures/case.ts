import {structureType} from "../_utils";
import {Case} from "../../../src/abap/3_structures/structures";

const cases = [
  {abap: "CASE moo. ENDCASE."},
  {abap: "CASE moo. WHEN 2. ENDCASE."},
  {abap: "CASE moo. WHEN OTHERS. ENDCASE."},
  {abap: "CASE moo. WHEN 2. WRITE 'foo'. ENDCASE."},
  {abap: "CASE moo. WHEN 2. WRITE 'foo'. WRITE 'bar'. ENDCASE."},
  {abap: "CASE moo. WHEN 2. WHEN 3. ENDCASE."},
];

structureType(cases, new Case());