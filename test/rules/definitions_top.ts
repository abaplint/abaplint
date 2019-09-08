import {DefinitionsTop} from "../../src/rules/definitions_top";
import {testRule} from "./_utils";

const tests = [
  {
    abap: `
FORM foobar.
	data: lt_file type foo.
	write 'hello'.
	DATA int type i.
ENDFORM.`,
    cnt: 1,
  },

  {
    abap: `
FORM foobar.
	data: lt_file type foo.
	DATA int type i.
	write 'hello'.
ENDFORM.`,
    cnt: 0,
  },

  {
    abap: `
FORM foo.
	TYPES: BEGIN OF ty_sort,
				sort TYPE string,
			END OF ty_sort.
ENDFORM.`,
    cnt: 0,
  },

  {
    abap: `
FORM foo.
	DATA: BEGIN OF ls_sort,
			sort TYPE string,
		  END OF ls_sort.
ENDFORM.`
    , cnt: 0,
  },

  {
    abap: `
FORM foo.
	STATICS: BEGIN OF ss_cached_client,
				username TYPE string,
			  END OF ss_cached_client.
			  DATA: lv_http_code TYPE i.
ENDFORM.`,
    cnt: 0,
  },

  {
    abap: `
FORM foo.
	TYPES: BEGIN OF lty_color_line,
			color TYPE lvc_t_scol.
			INCLUDE TYPE gty_status.
	TYPES: END OF lty_color_line.
ENDFORM.`,
    cnt: 0,
  },
];

testRule(tests, DefinitionsTop);