import {TypesNaming} from "../../src/rules/types_naming";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE 'hello'.", cnt: 0},
  {abap: "TYPES foo.", cnt: 1},
  {abap: "TYPES tyfoo.", cnt: 1},
  {abap: "TYPES ty_foo.", cnt: 0},
  {abap: "TYPES BEGIN OF bar.\nTYPES moo.\nTYPES END OF bar.", cnt: 1},
  {abap: "TYPES BEGIN OF ty_bar.\nTYPES moo.\nTYPES END OF ty_bar.", cnt: 0},

  {abap: `TYPES:
BEGIN OF ty_foo,
  lazy TYPE abap_bool,
  BEGIN OF boo,
    controller TYPE REF TO object,
  END OF boo,
END OF ty_foo.`, cnt: 0},

  {abap: `types:
    begin of enum ty_bracket_type structure bracket_type,
      no_bracket,
      opening,
    end of enum ty_bracket_type structure bracket_type.`, cnt: 0},
];

testRule(tests, TypesNaming);