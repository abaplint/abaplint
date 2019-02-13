import {KeywordsUpper, KeywordsUpperConf} from "../../src/rules/keywords_upper";
import {testRule} from "./_utils";

const tests = [
  {abap: "if a = b.", cnt: 1},
  {abap: "foo = |sdf|.", cnt: 0},
  {abap: "foo = boolc( 1 = 2 ).", cnt: 0},
  {abap: "IF a = b.", cnt: 0},
  {abap: "IF A = b.", cnt: 1}, // "A" should be lower case
  {abap: "CLASS ZCL_ABAPGIT_ZLIB_STREAM IMPLEMENTATION.", cnt: 0}, // txn SE80 upper cases the keyword when saving
  {abap: "CALL FUNCTION 'ZMOOBOO'\n" +
  "EXPORTING\n" +
  "  iv_fild     = lv_value\n" +
  "EXCEPTIONS\n" +
  "  invalid_boo = 1\n" +
  "  OTHERS      = 2.", cnt: 0},
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
];

testRule(tests, KeywordsUpper);

const tests2 = [
  {abap: "class ycl_something definition public final.\nendclass.\n", cnt: 0},
  {abap: "class ycl_something definition public final.\nendclass.\nwrite foo.", cnt: 1},
];

const config = new KeywordsUpperConf();
config.ignoreGlobalClassDefinition = true;

testRule(tests2, KeywordsUpper, config);