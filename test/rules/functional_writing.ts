import {FunctionalWriting} from "../../src/rules/functional_writing";
import {testRule} from "../utils";

let tests = [
  {abap: "CALL METHOD zcl_class=>method( ).", cnt: 1},
  {abap: "CalL METHOD zcl_class=>method( ).", cnt: 1},
  {abap: "CALL METHOD (lv_class_name)=>jump.", cnt: 0},
  {abap: "CALL METHOD mo_plugin->('SET_FILES').", cnt: 0},
  {abap: "CALL METHOD (method_name) PARAMETER-TABLE parameters.", cnt: 0},
];

testRule(tests, "test functional_writing rule", FunctionalWriting);