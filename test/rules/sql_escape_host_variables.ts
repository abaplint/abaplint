import {SQLEscapeHostVariables} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE hello.", cnt: 0},
  {abap: "SELECT SINGLE bname FROM usr02 INTO lv_bname.", cnt: 1},
  {abap: "SELECT SINGLE bname FROM usr02 INTO @lv_bname.", cnt: 0},
  {abap: "SELECT SINGLE foo bar INTO (@<ls_data>-foo, @<ls_data>-bar) FROM zfoo.", cnt: 0},
  {abap: "SELECT * FROM usr02 INTO TABLE lt_data.", cnt: 1},
  {abap: "SELECT * FROM usr02 INTO TABLE @lt_data.", cnt: 0},
  {abap: "SELECT SINGLE foo bar INTO (<ls_data>-foo, <ls_data>-bar) FROM zfoo.", cnt: 1},
  {abap: "SELECT * FROM usr02 APPENDING CORRESPONDING FIELDS OF TABLE @lt_data.", cnt: 0},
  {abap: "SELECT * FROM usr02 APPENDING TABLE @lt_data.", cnt: 0},
  {abap: "SELECT SINGLE bname FROM usr02 INTO (@lv_bname).", cnt: 0},
];

testRule(tests, SQLEscapeHostVariables);