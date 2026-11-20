import {expect} from "chai";
import {UnitTestAssertions, UnitTestAssertionsConf} from "../../src/rules/unit_test_assertions";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {testRule} from "./_utils";

function testClass(body: string, definition = "FOR TESTING DURATION SHORT RISK LEVEL HARMLESS"): string {
  return `CLASS ltcl_test DEFINITION FINAL ${definition}.
  PRIVATE SECTION.
    DATA mv_value TYPE i.
    DATA mo_ref TYPE REF TO ltcl_test.
    METHODS test FOR TESTING.
    METHODS get RETURNING VALUE(rv_value) TYPE i.
ENDCLASS.

CLASS ltcl_test IMPLEMENTATION.
  METHOD test.
    DATA lv_count TYPE i.
    DATA lv_flag TYPE abap_bool.
    DATA lt_rows TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
${body}
  ENDMETHOD.
  METHOD get.
  ENDMETHOD.
ENDCLASS.`;
}

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE hello.", cnt: 0},

  // cannotFail, reported
  {abap: testClass(`cl_abap_unit_assert=>assert_equals( act = lv_count exp = lv_count ).`), cnt: 1},
  {abap: testClass(`cl_abap_unit_assert=>assert_equals( exp = lv_count act = lv_count msg = 'count' ).`), cnt: 1},
  {abap: testClass(`cl_abap_unit_assert=>assert_equals( act = 1 exp = 1 ).`), cnt: 1},
  {abap: testClass(`cl_abap_unit_assert=>assert_equals( act = 'abc' exp = 'abc' ).`), cnt: 1},
  {abap: testClass(`cl_abap_unit_assert=>assert_equals( act = mo_ref->mv_value exp = MO_REF->MV_VALUE ).`), cnt: 1},
  {abap: testClass(`cl_abap_unit_assert=>assert_equals( act = abap_true exp = abap_true ).`), cnt: 1},
  {abap: testClass(`cl_abap_unit_assert=>assert_equals_float( act = lv_count exp = lv_count ).`), cnt: 1},
  {abap: testClass(`cl_aunit_assert=>assert_equals( act = lv_count exp = lv_count ).`), cnt: 1},
  {abap: testClass(`CALL METHOD cl_abap_unit_assert=>assert_equals
      EXPORTING
        act = lv_count
        exp = lv_count.`), cnt: 1},
  {abap: testClass(`cl_abap_unit_assert=>assert_true( abap_true ).`), cnt: 1},
  {abap: testClass(`CALL METHOD cl_abap_unit_assert=>assert_true( abap_true ).`), cnt: 1},
  {abap: testClass(`CALL METHOD cl_abap_unit_assert=>assert_true EXPORTING act = abap_true.`), cnt: 1},
  {abap: testClass(`cl_abap_unit_assert=>assert_true( act = abap_true ).`), cnt: 1},
  {abap: testClass(`cl_abap_unit_assert=>assert_true( 'X' ).`), cnt: 1},
  {abap: testClass(`IF lv_count = 2.
      cl_abap_unit_assert=>assert_true( abap_true ).
    ENDIF.`), cnt: 1},
  {abap: testClass(`cl_abap_unit_assert=>assert_false( abap_false ).`), cnt: 1},
  {abap: testClass(`cl_abap_unit_assert=>assert_false( space ).`), cnt: 1},
  {abap: testClass(`cl_abap_unit_assert=>assert_false( act = ' ' msg = 'never' ).`), cnt: 1},

  // cannotFail, not reported
  {abap: testClass(`cl_abap_unit_assert=>assert_equals( act = lv_count exp = 2 ).`), cnt: 0},
  {abap: testClass(`cl_abap_unit_assert=>assert_equals( act = 'abc' exp = 'ABC' ).`), cnt: 0},
  {abap: testClass(`cl_abap_unit_assert=>assert_equals( act = 1 exp = 2 ).`), cnt: 0},
  {abap: testClass(`cl_abap_unit_assert=>assert_equals( act = abap_true exp = 'X' ).`), cnt: 0},
  {abap: testClass(`cl_abap_unit_assert=>assert_equals( act = get( ) exp = get( ) ).`), cnt: 0},
  {abap: testClass(`cl_abap_unit_assert=>assert_equals( act = lines( lt_rows ) exp = lines( lt_rows ) ).`), cnt: 0},
  {abap: testClass(`cl_abap_unit_assert=>assert_equals( act = NEW ltcl_test( ) exp = NEW ltcl_test( ) ).`), cnt: 0},
  {abap: testClass(`cl_abap_unit_assert=>assert_differs( act = lv_count exp = lv_count ).`), cnt: 0},
  {abap: testClass(`cl_abap_unit_assert=>assert_true( lv_flag ).`), cnt: 0},
  {abap: testClass(`cl_abap_unit_assert=>assert_true( act = lv_flag msg = 'X' ).`), cnt: 0},
  {abap: testClass(`cl_abap_unit_assert=>assert_true( abap_false ).`), cnt: 0},
  {abap: testClass(`cl_abap_unit_assert=>assert_false( abap_true ).`), cnt: 0},
  {abap: testClass(`cl_abap_unit_assert=>assert_bound( mo_ref ).`), cnt: 0},
  {abap: testClass(`cl_abap_unit_assert=>assert_initial( lv_count ).`), cnt: 0},
  {abap: testClass(`cl_abap_unit_assert=>fail( ).`), cnt: 0},
  {abap: testClass(`cl_other_assert=>assert_equals( act = lv_count exp = lv_count ).`), cnt: 0},
  {abap: testClass(`cl_abap_unit_assert=>assert_equals( act = lv_count exp = lv_count ).`, "FINAL"), cnt: 0},

  // assertStatement
  {abap: testClass(`ASSERT lv_count = 2.`), cnt: 1},
  {abap: testClass(`ASSERT lv_flag = abap_true.
    ASSERT lt_rows IS INITIAL.`), cnt: 2},
  {abap: testClass(`ASSERT lv_count = 2.`, "FINAL"), cnt: 0},
  {abap: `ASSERT 1 = 2.`, cnt: 0},
];

testRule(tests, UnitTestAssertions);

const cannotFailOff = new UnitTestAssertionsConf();
cannotFailOff.cannotFail = false;
testRule([
  {abap: testClass(`cl_abap_unit_assert=>assert_equals( act = lv_count exp = lv_count ).`), cnt: 0},
  {abap: testClass(`ASSERT lv_count = 2.`), cnt: 1},
], UnitTestAssertions, cannotFailOff, "unit_test_assertions, cannotFail off");

const assertStatementOff = new UnitTestAssertionsConf();
assertStatementOff.assertStatement = false;
testRule([
  {abap: testClass(`cl_abap_unit_assert=>assert_equals( act = lv_count exp = lv_count ).`), cnt: 1},
  {abap: testClass(`ASSERT lv_count = 2.`), cnt: 0},
], UnitTestAssertions, assertStatementOff, "unit_test_assertions, assertStatement off");

describe("unit_test_assertions, global class", () => {
  const main = `CLASS zcl_cut DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS run.
ENDCLASS.

CLASS zcl_cut IMPLEMENTATION.
  METHOD run.
    ASSERT 1 = 1.
  ENDMETHOD.
ENDCLASS.`;

  const testclasses = `CLASS ltcl_test DEFINITION DEFERRED.
CLASS ltcl_test DEFINITION FINAL FOR TESTING DURATION SHORT RISK LEVEL HARMLESS.
  PRIVATE SECTION.
    METHODS test FOR TESTING.
ENDCLASS.

CLASS ltcl_helper DEFINITION FINAL.
  PUBLIC SECTION.
    CLASS-METHODS check.
ENDCLASS.

CLASS ltcl_helper IMPLEMENTATION.
  METHOD check.
    ASSERT 1 = 1.
  ENDMETHOD.
ENDCLASS.

CLASS ltcl_test IMPLEMENTATION.
  METHOD test.
    DATA lv_count TYPE i.
    ASSERT lv_count = 0.
    cl_abap_unit_assert=>assert_equals( act = lv_count exp = lv_count ).
  ENDMETHOD.
ENDCLASS.`;

  it("reports in the test class only, with message and position", () => {
    const reg = new Registry();
    reg.addFile(new MemoryFile("zcl_cut.clas.abap", main));
    reg.addFile(new MemoryFile("zcl_cut.clas.testclasses.abap", testclasses));
    reg.parse();
    const issues = new UnitTestAssertions().initialize(reg).run(reg.getFirstObject()!);
    expect(issues.length).to.equal(2);
    expect(issues[0].getFilename()).to.equal("zcl_cut.clas.testclasses.abap");
    expect(issues[0].getStart().getRow()).to.equal(21);
    expect(issues[0].getMessage()).to.contain("ASSERT");
    expect(issues[1].getStart().getRow()).to.equal(22);
    expect(issues[1].getMessage()).to.equal("Assertion cannot fail, act and exp are the same");
  });

  it("reports in a global FOR TESTING class", () => {
    const abap = `CLASS zcl_test_helper DEFINITION PUBLIC FINAL CREATE PUBLIC FOR TESTING.
  PUBLIC SECTION.
    CLASS-METHODS check IMPORTING iv_value TYPE i.
ENDCLASS.

CLASS zcl_test_helper IMPLEMENTATION.
  METHOD check.
    ASSERT iv_value > 0.
  ENDMETHOD.
ENDCLASS.`;
    const reg = new Registry().addFile(new MemoryFile("zcl_test_helper.clas.abap", abap)).parse();
    const issues = new UnitTestAssertions().initialize(reg).run(reg.getFirstObject()!);
    expect(issues.length).to.equal(1);
  });
});
