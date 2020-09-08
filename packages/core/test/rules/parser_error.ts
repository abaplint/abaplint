import {ParserError} from "../../src/rules/parser_error";
import {testRule} from "./_utils";

const tests = [
  {abap: "blah blah.", cnt: 1},
  {abap: "WRITE: / 'abc'.", cnt: 0},
  {abap: "##EXISTS\nENDMETHOD.", cnt: 0},
  {abap: "##needed.", cnt: 0},
  {abap: "moo( 'sdf' ).", cnt: 0},
  {abap: "moo( bar ).", cnt: 0},
  {abap: "APPEND NEW lcl_foo( VALUE #( connid = '456') ) TO foos.", cnt: 1},
  {abap: "DEFINE _foo.\nEND-OF-DEFINITION.\n_foo.", cnt: 0},
  {abap: "DEFINE _foo.\nEND-OF-DEFINITION.\n_foo ##CALLED.", cnt: 0},
  {abap: "DEFINE _foo.\nEND-OF-DEFINITION.\n##CALLED _foo.", cnt: 0},
  {abap: "DEFINE _foo.\nEND-OF-DEFINITION.\n_foo bar.", cnt: 0},
  {abap: "ro_alv->get_columns(:\n" +
    ")->get_column( 'TIMESTAMP' )->set_visible( abap_false ),\n" +
    ")->get_column( 'USERNAME' )->set_visible( abap_false ).", cnt: 0},
  {abap: "WRITE.", cnt: 1},

  {abap: `
  DATA rv_text TYPE string.
  DEFINE _out.
    rv_text = rv_text && &1 && cl_abap_char_utilities=>cr_lf.
  END-OF-DEFINITION.
  _out 'digraph {'.`, cnt: 0},

  {abap: `
DEFINE encrypt_key.
  CLEAR : lv_sas_key, lv_decoded_xstr.
END-OF-DEFINITION.
encrypt_key.`, cnt: 0},

  {abap: `
DEFINE _foo.
  WRITE 'hello'.
END-OF-DEFINITION.
DEFINE _bar.
  _foo.
END-OF-DEFINITION.
_bar.`, cnt: 0},

];

testRule(tests, ParserError);