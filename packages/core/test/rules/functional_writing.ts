import {FunctionalWriting} from "../../src/rules/functional_writing";
import {testRule} from "./_utils";

const tests = [
  {abap: "CALL METHOD zcl_class=>method( ).", cnt: 1},
  {abap: "CalL METHOD zcl_class=>method( ).", cnt: 1},
  {abap: "CALL METHOD (lv_class_name)=>jump.", cnt: 0},
  {abap: "CALL METHOD mo_plugin->('SET_FILES').", cnt: 0},
  {abap: "CALL METHOD (method_name) PARAMETER-TABLE parameters.", cnt: 0},
  {abap: `CLASS ZCL_NOT_AN_EXCEPTION IMPLEMENTATION.
            method CONSTRUCTOR.
              CALL METHOD SUPER->CONSTRUCTOR
                EXPORTING
                  TEXTID = TEXTID
                  PREVIOUS = PREVIOUS.
            endmethod.
          ENDCLASS.`, cnt: 1},
];

testRule(tests, FunctionalWriting);