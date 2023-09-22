import {DefinitionsTop} from "../../src/rules/definitions_top";
import {testRule, testRuleFixSingle} from "./_utils";

function testFix(input: string, expected: string, noIssuesAfter = true) {
  testRuleFixSingle(input, expected, new DefinitionsTop(), undefined, undefined, noIssuesAfter);
}

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
	write 'hello'.
  DATA: begin of int,
  moo type i,
  end of int.
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

  {
    abap: `
FORM foo.
  parser error
  DATA foo TYPE i.
ENDFORM.`,
    cnt: 0,
  },

  {
    abap: `
FORM foo.
  TRY.
  parser error
ENDFORM.`,
    cnt: 0,
  },

  {
    abap: `
FORM foo.
  DEFINE _visit_blob.
    WRITE 2.
  END-OF-DEFINITION.
  DATA bar.
ENDFORM.`,
    cnt: 0,
  },

  {
    abap: `
FORM func.
  CASE 2.
    WHEN '(export'.
      DATA lv_export_name TYPE string.
  ENDCASE.
ENDFORM.`,
    cnt: 1,
  },

  {
    abap: `
FORM func.
  IF 1 = 2.
    DATA lv_export_name TYPE string.
  ENDIF.
ENDFORM.`,
    cnt: 1,
  },

  {
    abap: `
FORM foo.
  DATA(diff) = 2.
  DATA row LIKE diff.
ENDFORM.`,
    cnt: 0,
    fix: false,
  },

  {
    abap: `
FORM foo.
  WRITE 'moo'.
  DATA: BEGIN OF ls_foo,
          bar TYPE i,
        END OF ls_foo,
        BEGIN OF ls_bar,
          bar TYPE i,
        END OF ls_bar.
ENDFORM.`,
    cnt: 1,
    fix: false,
  },

  { // parser error
    abap: `
FORM foobar.
	data: lt_file type foo.
	write 'hello' sdfsd.
	DATA int type i.
ENDFORM.`,
    cnt: 0,
  },

  { // another parser error
    abap: `
FORM foobar.
	data: lt_file type foo.
  CLEAR temp1.
	write 'hello' sdfsd.
	DATA int type i.
ENDFORM.`,
    cnt: 0,
  },

  {
    abap: `
FORM bar.
  WRITE 'sdf'.

  DATA lr_request TYPE REF TO object.

  IF lr_request IS NOT INITIAL.
    DATA(auth) = 2.
  ENDIF.
ENDFORM.`,
    cnt: 1,
  },

  {
    abap: `
FORM bar.
  WRITE 'sdf'.

  DATA(sdf) = 2.
ENDFORM.`,
    cnt: 0,
  },

];

testRule(tests, DefinitionsTop);


describe("Rule: definitions_top, quick fixes", () => {

  it("quick fix 1", async () => {
    const abap = `CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS bar.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD bar.
    WRITE 2.
    DATA foo TYPE c.
  ENDMETHOD.
ENDCLASS.`;
    const expected = `CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS bar.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD bar.
    DATA foo TYPE c.
    WRITE 2.
` + "    " + `
  ENDMETHOD.
ENDCLASS.`;
    testFix(abap, expected);
  });

  it("quick fix 2", async () => {
    const abap = `
FORM bar.
  TYPES ty_foo TYPE i.
  WRITE 'hello'.
  DATA moo TYPE ty_foo.
ENDFORM.`;
    const expected = `
FORM bar.
  TYPES ty_foo TYPE i.
  DATA moo TYPE ty_foo.
  WRITE 'hello'.
` + "  " + `
ENDFORM.`;
    testFix(abap, expected);
  });

  it("quick fix 3", async () => {
    const abap = `
FORM foo.
  TYPE-POOLS vsdfds.
  DATA: asdf TYPE string,
         foo TYPE string.
  CLEAR asdf.
  CLEAR foo.
ENDFORM.`;
    const expected = `
FORM foo.
  DATA asdf TYPE string.
  TYPE-POOLS vsdfds.
  DATA: foo TYPE string.
  CLEAR asdf.
  CLEAR foo.
ENDFORM.`;
    testFix(abap, expected, false);
  });

  it("quick fix 4", async () => {
    const abap = `
FORM foo.
  TYPES:
      BEGIN OF my_structure,
        my_first_element TYPE string,
      END OF my_structure.
  WRITE 'moo'.
DATA temp109 TYPE my_structure.
ENDFORM.`;
    const expected = `
FORM foo.
  TYPES:
      BEGIN OF my_structure,
        my_first_element TYPE string,
      END OF my_structure.
DATA temp109 TYPE my_structure.
  WRITE 'moo'.

ENDFORM.`;
    testFix(abap, expected, false);
  });

  it("quick fix 5, basic chained", async () => {
    const abap = `
FORM foo.
  WRITE 'moo'.
  DATA: BEGIN OF ls_foo,
          bar TYPE i,
        END OF ls_foo.
ENDFORM.`;
    const expected = `
FORM foo.
DATA BEGIN OF ls_foo.
DATA bar TYPE i.
DATA END OF ls_foo.
  WRITE 'moo'.
` + "  " + `
ENDFORM.`;
    testFix(abap, expected, false);
  });

});