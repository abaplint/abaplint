import {testRule} from "./_utils";
import {UseMessageClass} from "../../src/rules";

const tests = [
  // ok: structured form with class in parens
  {abap: `MESSAGE e001(bc_msg).`, cnt: 0},
  // ok: ID/TYPE/NUMBER form
  {abap: `MESSAGE ID 'BC_MSG' TYPE 'E' NUMBER '001'.`, cnt: 0},
  // ok: parser error
  {abap: `parser error`, cnt: 0},
  // bad: inline literal text
  {abap: `MESSAGE 'Something went wrong' TYPE 'E'.`, cnt: 1},
  // bad: backtick literal
  {abap: "MESSAGE `Something went wrong` TYPE 'E'.", cnt: 1},
  // bad: variable as message text (not a SE91 class reference)
  {abap: `MESSAGE lv_text TYPE 'E'.`, cnt: 1},
  // bad: text element (TEXT-t01) as message text
  {abap: `MESSAGE TEXT-t01 TYPE 'E'.`, cnt: 1},
  // ok: variable in structured message (not flagged — no literal)
  {abap: `MESSAGE e001(bc_msg) WITH lv_text.`, cnt: 0},
];

testRule(tests, UseMessageClass);
