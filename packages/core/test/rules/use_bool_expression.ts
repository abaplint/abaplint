import {testRule} from "./_utils";
import {UseBoolExpression} from "../../src/rules";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "CREATE OBJECT foobar.", cnt: 0},

  {abap: `IF line IS INITIAL.
  has_entries = abap_false.
ELSE.
  has_entries = abap_true.
ENDIF.`, cnt: 1},

  {abap: `IF line IS INITIAL.
  has_entries = abap_false.
ELSE.
  blah = abap_true.
ENDIF.`, cnt: 0},

  {abap: `IF line IS INITIAL.
  has_entries = abap_false.
ELSE.
  has_entries = abap_false.
ENDIF.`, cnt: 0},

  {abap: `IF line IS INITIAL.
  has_entries = abap_false.
ELSEIF moo = boo.
  WRITE 'bar'.
ELSE.
  has_entries = abap_true.
ENDIF.`, cnt: 0},

  {abap: `IF line IS INITIAL.
  has_entries = abap_false.
  WRITE 'bar'.
ELSE.
  has_entries = abap_true.
ENDIF.`, cnt: 0},

  {abap: `IF sy-subrc <> 0.
  rv_send = abap_true.
ELSE.
  rv_send = abap_false.
ENDIF.`, cnt: 1},
];

testRule(tests, UseBoolExpression);
