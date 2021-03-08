import {NamesNoDash} from "../../src/rules/names_no_dash";
import {testRule} from "./_utils";

const tests = [
  {abap: "FORM foobar.\nENDFORM.", cnt: 0},
  {abap: "FORM foo-bar-bar.\nENDFORM.", cnt: 1},
  {abap: "FORM foo-.\nENDFORM.", cnt: 1},
  {abap: "FORM remove_toolbar USING pv_dynnr TYPE sy-dynnr.\nENDFORM.", cnt: 0},
  {abap: "jasdhasdf", cnt: 0},
  {abap: "DATA foobar TYPE c LENGTH 1.", cnt: 0},
  {abap: "DATA foo-bar TYPE c LENGTH 1.", cnt: 1},
  {abap: "SELECT-OPTIONS foo-bar FOR foobar-asdf.", cnt: 1},
  {abap: "PARAMETERS moo-boo LIKE foo-bar.", cnt: 1},
];

testRule(tests, NamesNoDash);