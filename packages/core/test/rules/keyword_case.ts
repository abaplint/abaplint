import {KeywordCase, KeywordCaseConf, KeywordCaseStyle} from "../../src/rules/keyword_case";
import {testRule, testRuleFix} from "./_utils";

const tests = [
  {abap: "if a = b.", cnt: 1},
  {abap: "foo = |sdf|.", cnt: 0},
  {abap: "foo = boolc( 1 = 2 ).", cnt: 0},
  {abap: "IF a = b.", cnt: 0},
  {abap: "IF A = b.", cnt: 1}, // "A" should be lower case
  {abap: "CLASS ZCL_ABAPGIT_ZLIB_STREAM IMPLEMENTATION.", cnt: 0}, // txn SE80 upper cases the keyword when saving
  {abap: `CALL FUNCTION 'ZMOOBOO'
  EXPORTING
    iv_fild     = lv_value
  EXCEPTIONS
    invalid_boo = 1
    OTHERS      = 2.`, cnt: 0},
  {abap: "LOOP AT SCREEN.", cnt: 0},
  {abap: "MODIFY SCREEN.", cnt: 0},
  {abap: "FIELD-SYMBOLS <lv_dst> TYPE ANY.", cnt: 0}, // todo, "ANY" should be lower case
  {abap: "FIELD-SYMBOLS <ls_auth> LIKE LINE OF gt_auth.", cnt: 0}, // todo
  {abap: "SELECT SINGLE ccnocliind FROM t000 INTO lv_ind WHERE mandt = sy-mandt.", cnt: 0},
  {abap: "SORT mt_items BY txt ASCENDING AS TEXT.", cnt: 0},
  {abap: "DELETE ADJACENT DUPLICATES FROM mt_requirements COMPARING ALL FIELDS.", cnt: 0},
  {abap: "AT FIRST.", cnt: 0},
  {abap: "SELECT devclass FROM tdevc INTO TABLE lt_list WHERE parentcl = mv_package ORDER BY PRIMARY KEY.", cnt: 0},
  {abap: "SELECT DISTINCT sprsl AS langu INTO TABLE lt_i18n_langs FROM t100t.", cnt: 0},
  {abap: "SELECTION-SCREEN BEGIN OF BLOCK b1 WITH FRAME TITLE TEXT-001.", cnt: 0},
  {abap: "FUNCTION ZFOOBAR.\n", cnt: 1},
  {abap: "SELECT foo UP TO @bar ROWS INTO CORRESPONDING FIELDS OF TABLE @boo FROM loo.", cnt: 0},
  {abap: "SORT rt_list BY repo-name AS TEXT ASCENDING.", cnt: 0},
  {abap: "IF foo = bar and moo = boo.", cnt: 1},
  {abap: "WRITE lv_date TO lv_str MM/DD/YYYY.", cnt: 0},
  {abap: "DATA mt_bar TYPE SORTED TABLE OF gty_sdf WITH UNIQUE KEY key WITH UNIQUE HASHED KEY unique COMPONENTS instance.", cnt: 0},

  {abap: `FORM check USING foo bar CHANGING moo return STRUCTURE bapiret2.
  ENDFORM.`, cnt: 0},

  {abap: `FORM default USING var STRUCTURE disvariant flag CHANGING return.
  ENDFORM.`, cnt: 0},

  {abap: `WRITE foo COLOR OFF INTENSIFIED.`, cnt: 0},
  {abap: `FORMAT COLOR COL_HEADING.`, cnt: 0},
  {abap: `SELECT * FROM sdfsd ORDER BY PRIMARY KEY.`, cnt: 0},
  {abap: `MODIFY LINE sy-index FIELD VALUE val FROM var.`, cnt: 0},
  {abap: "INSERT LINES OF lt_founds INTO TABLE rt_founds_all.", cnt: 0},
  {abap: "INSERT INITIAL LINE INTO lt_selection INDEX 1 ASSIGNING <ls_sel>.", cnt: 0},
  {abap: "DATA tab LIKE STANDARD TABLE OF bar WITH KEY foo INITIAL SIZE 2 WITH HEADER LINE.", cnt: 0},
  {abap: "INSERT node_tmp INTO TABLE mt_json_tree REFERENCE INTO node_ref.", cnt: 0},
  {abap: "FIND ALL OCCURRENCES OF REGEX || IN SECTION LENGTH 42 OF || MATCH OFFSET DATA(lv_off).", cnt: 0},
  {abap: "READ TABLE itab INDEX 5 TRANSPORTING ALL FIELDS INTO DATA(line).", cnt: 0},

  {abap: `
DEFINE _bar.
  write 'Hello World'.
END-OF-DEFINITION.
_bar.`, cnt: 0},

  {abap: `SYSTEM-CALL OBJMGR CLONE me TO result.`, cnt: 0},
];

testRule(tests, KeywordCase);

// ************************

const tests2 = [
  {abap: "class ycl_something definition public final.\nendclass.\n", cnt: 0},
  {abap: "interface zif_foobar public.\nendinterface.\n", cnt: 0},
  {abap: "class ycl_something definition public final.\nendclass.\nwrite foo.", cnt: 1},
];

const config2 = new KeywordCaseConf();
config2.ignoreGlobalClassDefinition = true;
config2.ignoreGlobalInterface = true;

testRule(tests2, KeywordCase, config2);

// ************************

const tests3 = [
  {abap: "FUNCTION ZFOOBAR.\n", cnt: 0},
  {abap: "FUNCTION zfoobar.\n", cnt: 0},
  {abap: "fUNCTION ZFOOBAR.\n", cnt: 1},
  {abap: "fUNCTION zfoobar.\n", cnt: 1},
];

const config3 = new KeywordCaseConf();
config3.ignoreFunctionModuleName = true;

testRule(tests3, KeywordCase, config3);

const config4 = new KeywordCaseConf();
config4.style = KeywordCaseStyle.Lower;

const tests4 = [
  {abap: "IF a = b.", cnt: 1},
  {abap: "foo = |sdf|.", cnt: 0},
  {abap: "foo = boolc( 1 = 2 ).", cnt: 0},
  {abap: "IF a = b.", cnt: 1},
  {abap: "IF A = b.", cnt: 1}, // "A" should be lower case
  {abap: "CLASS ZCL_ABAPGIT_ZLIB_STREAM IMPLEMENTATION.", cnt: 1}, // txn SE80 upper cases the keyword when saving
  {abap: `call function 'ZMOOBOO'
  exporting
    iv_fild     = lv_value
  exceptions
    invalid_boo = 1
    others      = 2.`, cnt: 0},
  {abap: "LOOP AT SCREEN.", cnt: 1},
  {abap: "MODIFY SCREEN.", cnt: 1},
  {abap: "field-symbols <lv_dst> type ANY.", cnt: 0}, // todo, "ANY" should be lower case
  {abap: "field-symbols <ls_auth> like line of gt_auth.", cnt: 0}, // todo
  {abap: "select single ccnocliind from t000 into lv_ind where mandt = sy-mandt.", cnt: 0},
  {abap: "sort mt_items by txt ascending as text.", cnt: 0},
  {abap: "delete adjacent duplicates from mt_requirements comparing all fields.", cnt: 0},
  {abap: "at first.", cnt: 0},
  {abap: "select devclass from tdevc into table lt_list where parentcl = mv_package order by primary key.", cnt: 0},
  {abap: "select distinct sprsl as langu into table lt_i18n_langs from t100t.", cnt: 0},
  {abap: "selection-screen begin of block b1 with frame title text-001.", cnt: 0},
  {abap: "function ZFOOBAR.\n", cnt: 1},
  {abap: "select foo up to @bar rows into corresponding fields of table @boo from loo.", cnt: 0},
  {abap: "sort rt_list by repo-name as text ascending.", cnt: 0},
];

testRule(tests4, KeywordCase, config4);

// Test ignoreKeywords
const config5 = new KeywordCaseConf();
config5.ignoreKeywords = ["TEXT", "WRITE"];
config5.style = KeywordCaseStyle.Upper;

const tests5 = [
  {abap: "IF a = b.", cnt: 0},
  {abap: "LOOP at screen.", cnt: 1},
  {abap: "write 'foo'.", cnt: 0},
  {abap: "WRITE 'foo'.", cnt: 0},
  {abap: "WriTE 'foo'.", cnt: 0},
  {abap: "SELECTION-SCREEN BEGIN OF BLOCK b1 WITH FRAME TITLE TEXT-001.", cnt: 0},
  {abap: "SELECTION-SCREEN BEGIN OF BLOCK b1 WITH FRAME TITLE text-001.", cnt: 0},
];

testRule(tests5, KeywordCase, config5);

// test inconsistent case in ignored keyword list
config5.ignoreKeywords = ["texT", "WrItE"];
testRule(tests5, KeywordCase, config5);

// ************************

const testLowerCaseGlobalClassSuite1 = [
  {
    abap: `
      class zcl_my definition final public.
        public section.
          methods x.
      endclass.
      class zcl_my implementation.
        method x. endmethod.
      endclass.
      `,
    cnt: 0,
  },
  {
    abap: `
      CLASS zcl_my definition FINAL public.
        public section.
          methods x.
      ENDCLASS.
      CLASS zcl_my IMPLEMENTATION.
        method x. endmethod.
      ENDCLASS.
      `,
    cnt: 1,
  },
  {
    abap: `
      INTERFACE zif_my PUBLIC.
        methods x.
      ENDINTERFACE.
      `,
    cnt: 1,
  },
  {
    abap: `
      class zcl_my definition final public.
        public section.
          METHODS x.
      endclass.
      class zcl_my implementation.
        method x. endmethod.
      endclass.
      `,
    cnt: 1,
  },
  {
    abap: `
      class zcl_my definition final public.
        public section.
          methods x.
      endclass.
      class zcl_my implementation.
        METHOD x. endmethod.
      endclass.
      `,
    cnt: 1,
  },
];
const configLowerCaseGlobalClass1 = {
  ...new KeywordCaseConf(),
  style: KeywordCaseStyle.Lower,
};
testRule(testLowerCaseGlobalClassSuite1, KeywordCase, configLowerCaseGlobalClass1, "keywordCase: lower");

// no errors in case 2 for suite 2
const testLowerCaseGlobalClassSuite2 = testLowerCaseGlobalClassSuite1.map((c, idx) => {
  if (idx === 1 || idx === 2) { // Case 2 and 3
    return {...c, cnt: 0}; // clear cnt ( = no error )
  } else {
    return c;
  }
});
const configLowerCaseGlobalClass2 = {
  ...new KeywordCaseConf(),
  style: KeywordCaseStyle.Lower,
  ignoreGlobalClassBoundaries: true,
};
testRule(testLowerCaseGlobalClassSuite2, KeywordCase, configLowerCaseGlobalClass2, "keywordCase: lower + ignore boundaries");

const fixTests = [
  {
    input: "write bar.",
    output: "WRITE bar.",
  },
  {
    input: "WRITE BAR.",
    output: "WRITE bar.",
  },
  /*
  { // fix as much as possible in the statement
    input: "write BAR.",
    output: "WRITE bar.",
  },
  */
];

testRuleFix(fixTests, KeywordCase);