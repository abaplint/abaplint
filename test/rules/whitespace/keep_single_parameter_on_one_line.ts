import {testRule} from "../_utils";
import {KeepSingleParameterCallsOnOneLine} from "../../../src/rules";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE: / 'abc'.", cnt: 0},
  {abap: "call_method( ).", cnt: 0},
  {abap: "call_method( 2 ).", cnt: 0},
  {abap: "DATA(unique_list) = remove_duplicates( list ).", cnt: 0},
  {abap: "remove_duplicates( CHANGING list = list ).", cnt: 0},
  {abap: `DATA(unique_list) = remove_duplicates(
    list ).`, cnt: 1},
  {abap: `remove_duplicates(
  CHANGING
    list = list ).`, cnt: 1},
  {abap: `somee_thing_very_long_variable_so_it_does_not_fit_on_one_line = remove_duplicates(
      CHANGING
        list = liiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiist ).`, cnt: 0},
  {abap: `io_html->add( render_text_input(
    iv_name  = |filter|
    iv_label = |Filter: |
    iv_value = mv_filter ) ).`, cnt: 0},
  {abap: `io_html->add( render_text_input(
    iv_name = |filter| ) ).`, cnt: 1},
  {abap: `io_html->add(
    iv_name = moo( ) ).`, cnt: 1},
];

testRule(tests, KeepSingleParameterCallsOnOneLine);