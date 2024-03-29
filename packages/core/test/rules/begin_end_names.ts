import {BeginEndNames} from "../../src/rules/begin_end_names";
import {testRule, testRuleFix} from "./_utils";

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

  {abap: `
  DATA: BEGIN OF COMMON PART foo,
        field TYPE i,
      END OF COMMON PART.`, cnt: 0},

  {abap: "DATA: BEGIN OF moo, END OF moo.", cnt: 1}, // no content

  {abap: `
  DATA: BEGIN OF moo,
        BEGIN OF bar,
          field TYPE string,
        END OF bar,
      END OF moo.`, cnt: 0},

  {abap: `
TYPES: BEGIN OF t,
         attri      sdfsd,
         name_value TYPE STANDARD TABLE OF string WITH EMPTY KEY,
       END OF t.`, cnt: 0},

  {abap: `
  TYPES: BEGIN OF something,
           something TYPE STANDARD TABLE OF  WITH DEFAULT KEY,
         END OF something.`, cnt: 0}, // contains unknown so dont report it

];

testRule(tests, BeginEndNames);

const fixTests = [
  {
    input: "TYPES: BEGIN OF moo, dsf TYPE string, END OF bar.",
    output: "TYPES: BEGIN OF moo, dsf TYPE string, END OF moo.",
  },
  {
    input: "TYPES: BEGIN OF ENUM moo, blah, END OF ENUM bar.",
    output: "TYPES: BEGIN OF ENUM moo, blah, END OF ENUM moo.",
  },
  // difference in inner type
  {
    input: "DATA: BEGIN OF foo, BEGIN OF bar2, f TYPE string, END OF bar1, END OF foo.",
    output: "DATA: BEGIN OF foo, BEGIN OF bar2, f TYPE string, END OF bar2, END OF foo.",
  },
  // difference in outer type
  {
    input: "DATA: BEGIN OF foo, BEGIN OF bar2, f TYPE string, END OF bar2, END OF fooaaa.",
    output: "DATA: BEGIN OF foo, BEGIN OF bar2, f TYPE string, END OF bar2, END OF foo.",
  },
];

testRuleFix(fixTests, BeginEndNames);