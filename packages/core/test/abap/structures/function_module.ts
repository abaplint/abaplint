import {structureType} from "../_utils";
import {FunctionModule} from "../../../src/abap/3_structures/structures";

const cases = [
  {abap: "FUNCTION zfoo. ENDFUNCTION."},
  {abap: "FUNCTION zfoo. WRITE 'a'. ENDFUNCTION."},
  {abap: `FUNCTION zfoo IMPORTING iv_a TYPE string.
  WRITE iv_a.
ENDFUNCTION.`},
  {abap: `FUNCTION yspd_fm_sc_rms_background_job
  IMPORTING VALUE(iv_jobname) TYPE btcjob OPTIONAL
            VALUE(iv_timestamps) TYPE string OPTIONAL
            VALUE(iv_date) TYPE yspd_de_datum OPTIONAL
  EXPORTING VALUE(ev_jobcount) TYPE btcjobcnt.
  ev_jobcount = 1.
ENDFUNCTION.`},
  {abap: `FUNCTION zfoo TABLES it_a STRUCTURE dbtab EXCEPTIONS not_found.
ENDFUNCTION.`},
];

structureType(cases, new FunctionModule());
