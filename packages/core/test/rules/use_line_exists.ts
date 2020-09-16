import {testRule} from "./_utils";
import {UseLineExists} from "../../src/rules";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "CREATE OBJECT foobar.", cnt: 0},
  {abap: `
  READ TABLE my_table TRANSPORTING NO FIELDS WITH KEY key = 'A'.
  IF sy-subrc = 0.
  ENDIF.`, cnt: 1},
  {abap: `
  READ TABLE my_table TRANSPORTING NO FIELDS WITH KEY key = 'A'.
  IF sy-subrc = 4.
  ENDIF.`, cnt: 1},
  {abap: `
  READ TABLE my_table TRANSPORTING NO FIELDS WITH KEY key = 'A'.
  IF sy-subrc <> 0.
  ENDIF.`, cnt: 1},
  {abap: `
  READ TABLE my_table TRANSPORTING NO FIELDS WITH KEY key = 'A'.
* comment
  IF sy-subrc = 0.
  ENDIF.`, cnt: 1},
];

testRule(tests, UseLineExists);
