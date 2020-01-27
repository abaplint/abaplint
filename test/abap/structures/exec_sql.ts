import {structureType} from "../_utils";
import {ExecSQL} from "../../../src/abap/structures";

const cases = [
//  {abap: "EXEC SQL. ENDEXEC."},
  {abap: `EXEC sql.
    select PROGNAME into :l_progname from REPOLOAD where PROGNAME = :p_prehdr
    ENDEXEC.`},
];

structureType(cases, new ExecSQL());