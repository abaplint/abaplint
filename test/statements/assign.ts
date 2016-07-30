import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

  let tests = [
    "ASSIGN COMPONENT ls_field-name OF STRUCTURE ig_file TO <lv_field>.",
    "ASSIGN ('(SAPLSIFP)TTAB') TO <lg_any>.",
    "ASSIGN cs_tstcp-param(sy-fdpos) TO <lg_f>.",
    "ASSIGN cs_tstcp-param(sdf) TO <lg_f>.",
    "ASSIGN cs_tstcp-param TO <lg_f>.",
    "ASSIGN lv_x TO <lv_y> CASTING.",
    ];

statementType(tests, "ASSIGN", Statements.Assign);
