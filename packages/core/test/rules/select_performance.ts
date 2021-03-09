import {SelectPerformance} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [

  // endselect
  {abap: `SELECT bar from mara INTO @foobar.
  ENDSELECT.`, cnt: 1},
  {abap: `SELECT bar from mara INTO TABLE @<lt_mara> PACKAGE SIZE @lv_pack.
  ENDSELECT.`, cnt: 0},

  // select star
  {abap: `SELECT * from mara INTO table @data(foobar).`, cnt: 1},
  {abap: `SELECT * FROM mara. ENDSELECT.`, cnt: 1},
  {abap: `SELECT foo, bar from mara INTO table @data(foobar).`, cnt: 0},
  {abap: `SELECT * from mara INTO corresponding fields of table @foobar.`, cnt: 0},
];

testRule(tests, SelectPerformance);
