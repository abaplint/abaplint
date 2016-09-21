import {DefinitionsTop} from "../../src/rules/definitions_top";
import {testRule} from "../utils";

let tests = [
  {abap: "FORM foobar.\ndata: lt_file type foo.\nwrite 'hello'.\nDATA int type i.\nENDFORM.", cnt: 1},
  {abap: "FORM foobar.\ndata: lt_file type foo.\nDATA int type i.\nwrite 'hello'.\nENDFORM.", cnt: 0},
  {abap: "FORM foo.\nTYPES: BEGIN OF ty_sort,\nsort TYPE string,\nEND OF ty_sort.\nENDFORM.", cnt: 0},
  {abap: "FORM foo.\nDATA: BEGIN OF ls_sort,\nsort TYPE string,\nEND OF ls_sort.\nENDFORM.", cnt: 0},
];

testRule(tests, "test definitions_top rule", DefinitionsTop);