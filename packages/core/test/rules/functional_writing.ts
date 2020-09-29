import {FunctionalWriting} from "../../src/rules/functional_writing";
import {testRule, testRuleFix} from "./_utils";

const tests = [
  {abap: "CALL METHOD zcl_class=>method( ).", cnt: 1},
  {abap: "CalL METHOD zcl_class=>method( ).", cnt: 1},
  {abap: "CALL METHOD (lv_class_name)=>jump.", cnt: 0},
  {abap: "CALL METHOD mo_plugin->('SET_FILES').", cnt: 0},
  {abap: "CALL METHOD (method_name) PARAMETER-TABLE parameters.", cnt: 0},
  {
    abap: `CLASS ZCL_NOT_AN_EXCEPTION IMPLEMENTATION.
            method CONSTRUCTOR.
              CALL METHOD SUPER->CONSTRUCTOR
                EXPORTING
                  TEXTID = TEXTID
                  PREVIOUS = PREVIOUS.
            endmethod.
          ENDCLASS.`, cnt: 1,
  },
  {
    abap: `CALL METHOD lo_http_utility->decode_base64
EXPORTING
  encoded = request->get_inner_rest_request( )->get_header_field( iv_name = 'Password' ).`, cnt: 1,
  },
];

testRule(tests, FunctionalWriting);

const fixTests = [
  {input: "CALL METHOD foo=>bar( ).", output: "foo=>bar( )."},
  {input: "CALL METHOD foo=>bar.", output: "foo=>bar( )."},
  {
    input: `CALL METHOD foo=>bar( EXPORTING iv_param = '1' CHANGING cv_param = lt_foo ).`,
    output: `foo=>bar( EXPORTING iv_param = '1' CHANGING cv_param = lt_foo ).`,
  },
  {
    input: `CALL METHOD foo=>bar EXPORTING iv_param = '1' CHANGING cv_param = lt_foo.`,
    output: `foo=>bar( EXPORTING iv_param = '1' CHANGING cv_param = lt_foo ).`,
  },

];
testRuleFix(fixTests, FunctionalWriting);