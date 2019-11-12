import {KeywordCase, KeywordCaseConf} from "../../src/rules/keyword_case";
import {testRule} from "./_utils";

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
  {abap: "MODIFY SCREEN.",  cnt: 0},
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
config4.style = "lower";

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
  {abap: "MODIFY SCREEN.",  cnt: 1},
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

