import {structureType} from "../_utils";
import {If} from "../../../src/abap/3_structures/structures";

const cases = [
  {abap: "IF foo = bar. ENDIF."},
  {abap: "IF foo = bar. WRITE 'bar'. ENDIF."},
  {abap: "IF foo = bar. ELSE. ENDIF."},
  {abap: "IF foo = bar. ELSEIF moo = boo. ENDIF."},
  {abap: "IF foo = bar. ELSEIF moo = boo. ELSE. ENDIF."},
  {abap: "IF foo = bar. ELSEIF moo = boo. ELSEIF boo = loo. ENDIF."},
  {abap: "IF 1 = 2. INTERFACE zif_bar LOAD. ENDIF."},
];

structureType(cases, new If());