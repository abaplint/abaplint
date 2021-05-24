import {ChainMainlyDeclarations, ChainMainlyDeclarationsConf} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: `WRITE hello.`, cnt: 0},
  {abap: `BREAK-POINT.`, cnt: 0},
  {abap: `WRITE: hello.`, cnt: 0},
  {abap: `CALL METHOD: hello.`, cnt: 1},
  {abap: `SPLIT ls_source-objnm AT ' ' INTO: DATA(lv_source) DATA(lv_rest).`, cnt: 1},
  {abap: `SORT: foo, bar.`, cnt: 1},
  {abap: `CONTROLS: ctrl1200 type tableview using screen 1200.`, cnt: 0},
  {abap: `CLASS lcl_foo DEFINITION.
  PUBLIC SECTION.
    EVENTS:
      pai EXPORTING VALUE(fcode) TYPE syst_ucomm,
      pbo.
ENDCLASS.`, cnt: 0},
  {abap: `LOCAL: foo, bar.`, cnt: 0},
  {abap: `TYPES:
  BEGIN OF ENUM te_content_type STRUCTURE content_type,
    right,
    target,
    left,
  END OF ENUM te_content_type STRUCTURE content_type.`, cnt: 0},
];

testRule(tests, ChainMainlyDeclarations);

const testsSort = [
  {abap: "SORT: variable", cnt: 1},
  {abap: "SORT variable", cnt: 0},
];

const config2 = new ChainMainlyDeclarationsConf();
config2.sort = false;

testRule(testsSort, ChainMainlyDeclarations, config2);