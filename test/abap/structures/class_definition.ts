import {structureType} from "../_utils";
import {ClassDefinition} from "../../../src/abap/3_structures/structures";

const cases = [
  {abap: "CLASS zfoo DEFINITION. ENDCLASS."},
  {abap: "CLASS zfoo DEFINITION. PUBLIC SECTION. CONSTANTS foo TYPE i VALUE 2. ENDCLASS."},
  {abap: "CLASS zfoo DEFINITION. PRIVATE SECTION. CONSTANTS foo TYPE i VALUE 2. ENDCLASS."},
  {abap: "CLASS zfoo DEFINITION. PROTECTED SECTION. CONSTANTS foo TYPE i VALUE 2. ENDCLASS."},
  {abap: `CLASS lcl_service DEFINITION FINAL.
    SET EXTENDED CHECK OFF.
    SET EXTENDED CHECK ON.
    ENDCLASS.`},
  {abap: `CLASS lcl_service DEFINITION.
    TYPE-POOLS: abcd.
    ENDCLASS.`},
  {abap: `CLASS lcl_service DEFINITION.
    TYPE-POOLS: abcd, efgh.
    ENDCLASS.`},
];

structureType(cases, new ClassDefinition());