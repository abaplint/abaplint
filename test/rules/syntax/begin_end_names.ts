import {BeginEndNames} from "../../../src/rules/syntax/begin_end_names";
import {testRule} from "../_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "parser error.", cnt: 0},
  {abap: "WRITE hello.", cnt: 0},

  {abap: "CONSTANTS: BEGIN OF moo, go_home TYPE string VALUE 'go_home', END OF bar.", cnt: 1},
  {abap: "CONSTANTS: BEGIN OF c_action, go_home TYPE string VALUE 'go_home', END OF c_action.", cnt: 0},

  {abap: "DATA: BEGIN OF moo, dsf TYPE string, END OF bar.", cnt: 1},
  {abap: "DATA: BEGIN OF moo, dsf TYPE string, END OF moo.", cnt: 0},

  {abap: `class foo definition.
    public section.
    CLASS-DATA: BEGIN OF moo, dsf TYPE string, END OF bar.
    endclass.`, cnt: 1},
  {abap: `class foo definition.
    public section.
    CLASS-DATA: BEGIN OF moo, dsf TYPE string, END OF moo.
    endclass.`, cnt: 0},

  {abap: "STATICS: BEGIN OF moo, dsf TYPE string, END OF bar.", cnt: 1},
  {abap: "STATICS: BEGIN OF moo, dsf TYPE string, END OF moo.", cnt: 0},

  {abap: "TYPES: BEGIN OF moo, dsf TYPE string, END OF bar.", cnt: 1},
  {abap: "TYPES: BEGIN OF moo, dsf TYPE string, END OF moo.", cnt: 0},

  {abap: "TYPES: BEGIN OF ENUM moo, blah, END OF ENUM bar.", cnt: 1},
  {abap: "TYPES: BEGIN OF ENUM moo, blah, END OF ENUM moo.", cnt: 0},

  {abap: "DATA: BEGIN OF foo, BEGIN OF bar2, f TYPE string, END OF bar, END OF foo.", cnt: 1},
  {abap: "DATA: BEGIN OF foo, BEGIN OF bar, f TYPE string, END OF bar, END OF foo.", cnt: 0},

  {abap: `
  DATA: BEGIN OF COMMON PART foo,
        field TYPE i,
      END OF COMMON PART foo.`, cnt: 0},
];

testRule(tests, BeginEndNames);