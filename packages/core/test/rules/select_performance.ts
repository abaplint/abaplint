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
  {abap: `SELECT * FROM mara. ENDSELECT.`, cnt: 2}, // both endselect and select *
  {abap: `SELECT foo, bar from mara INTO table @data(foobar).`, cnt: 0},
  {abap: `SELECT * from mara INTO corresponding fields of table @foobar.`, cnt: 0},
  {abap: `SELECT * FROM sdfsd APPENDING CORRESPONDING FIELDS OF TABLE @sdfsd-sdfsd
    WHERE sdfsd = @lv_sdf
    AND sss <> ' '.`, cnt: 0},
  {abap: `SELECT * FROM tab INTO @DATA(ls_tab) WHERE field = @l_var ORDER BY blah.
    ENDSELECT.`, cnt: 2}, // both endselect and select *
];

testRule(tests, SelectPerformance);
