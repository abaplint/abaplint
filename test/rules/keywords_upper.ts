import {KeywordsUpper} from "../../src/rules/keywords_upper";
import {testRule} from "./_utils";

const tests = [
  {abap: "if a = b.", cnt: 1},
  {abap: "foo = |sdf|.", cnt: 0},
  {abap: "foo = boolc( 1 = 2 ).", cnt: 0},
  {abap: "IF a = b.", cnt: 0},
  {abap: "CLASS ZCL_ABAPGIT_ZLIB_STREAM IMPLEMENTATION.", cnt: 0}, // txn SE80 upper cases the keyword when saving
  {abap: "FIELD-SYMBOLS <lv_dst> TYPE ANY.", cnt: 1}, // "ANY" should be lower case
  {abap: "CALL FUNCTION 'ZMOOBOO'\n" +
    "EXPORTING\n" +
    "  iv_fild     = lv_value\n" +
    "EXCEPTIONS\n" +
    "  invalid_boo = 1\n" +
    "  OTHERS      = 2.", cnt: 0},
];

testRule(tests, KeywordsUpper);