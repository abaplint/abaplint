import {statementType, statementVersion} from "../utils";
import * as Statements from "../../src/statements/";
import {Version} from "../../src/version";

let tests = [
  "ASSIGN COMPONENT ls_field-name OF STRUCTURE ig_file TO <lv_field>.",
  "ASSIGN ('(SAPLSIFP)TTAB') TO <lg_any>.",
  "ASSIGN cs_tstcp-param(sy-fdpos) TO <lg_f>.",
  "ASSIGN cs_tstcp-param(sdf) TO <lg_f>.",
  "ASSIGN cs_tstcp-param TO <lg_f>.",
  "assign lt_alv->* to <f_alv_tab>.",
  "ASSIGN <ls_aq_msg>-data TO <lv_data> CASTING TYPE (lv_tabname).",
  "ASSIGN COMPONENT <ls_component>-name OF STRUCTURE <lg_data> TO <lv_data> CASTING TYPE HANDLE lo_datadescr.",
  "ASSIGN lv_x TO <lv_y> CASTING.",
];

statementType(tests, "ASSIGN", Statements.Assign);

let versions = [
  {abap: "ASSIGN entity->* TO FIELD-SYMBOL(<entity>).", ver: Version.v740sp02},
];

statementVersion(versions, "ASSIGN", Statements.Assign);