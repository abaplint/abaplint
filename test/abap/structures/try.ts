import {structureType} from "../_utils";
import {Try} from "../../../src/abap/structures";

let cases = [
  {abap: "TRY. ENDTRY."},
  {abap: "TRY. CATCH cx_moo. ENDTRY."},
  {abap: "TRY. CATCH cx_moo. CATCH cx_boo. ENDTRY."},
  {abap: "TRY. CATCH cx_moo. CLEANUP. ENDTRY."},
  {abap: "TRY. CLEANUP. ENDTRY."},
  {abap: "TRY. WRITE bar. CATCH cx_moo. WRITE bar. ENDTRY."},
];

structureType(cases, new Try());