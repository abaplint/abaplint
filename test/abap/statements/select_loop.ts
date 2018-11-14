import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

let tests = [
  "SELECT foo FROM ztable.",
  "SELECT sdfs FROM basdf WHERE name is null.",
  "select netwr from vbakuk into l_netwr where vbeln = l_vbeln and vbtyp in ('C').",
  "SELECT * INTO data FROM table WHERE name LIKE l_name ESCAPE '!' AND text NOT LIKE l_text ESCAPE '!'.",
  "SELECT node_key INTO CORRESPONDING FIELDS OF @<entity> FROM snwd_so WHERE (where_clause) ORDER BY (orderby_clause).",
  "SELECT vbeln INTO CORRESPONDING FIELDS OF lt_table FROM vbak WHERE (where_clause) ORDER BY (orderby_clause).",
  "SELECT field INTO l_val FROM table WHERE field1 IN var AND field2 LT sy-datum AND field3 GT sy-datum AND NOT field4 = 'X'.",
  "select field into target up to 1 rows from tab where foo = bar.",
  "SELECT * FROM zfoo INTO ls_bar UP TO 1 ROWS WHERE moo = boo AND (lt_where) AND bar = foo.",
  "select field1 field2 into corresponding fields of gt_target from zfoo for all entries in lt_table where number = lt_table-number.",
  "SELECT p~field1 p~field2 INTO (lv_field1, lv_field2) FROM ztab AS p WHERE p~field = lv_field.",
  "select field count(*) into (l_field, l_count) from ztab where field = bar group by number.",
  "select field appending table lt_tab from ztable package size 10 where foo = 'B'.",
  "SELECT * FROM foo INTO CORRESPONDING FIELDS OF TABLE lt_foo PACKAGE SIZE 100 WHERE moo = stru-value1 AND boo = stru-value2.",
  "SELECT field1 field2 INTO  (lv_field1, lv_field2) FROM  ztab AS tab\n" +
  "  WHERE field < wa-field\n" +
  "  AND max >= ALL ( select max FROM  ztable WHERE field = wa-field ) ORDER BY field.",
  "select * from (name) into table <table> package size lv_size where (lv_where).",
//  "select field1 field2 into corresponding fields of table lt_tab from ztab package size 250 where flag = 'N' and id in s_docnum.",

  "SELECT field1 field2\n" +
  "  APPENDING CORRESPONDING FIELDS OF TABLE gt_data\n" +
  "  FROM ztable PACKAGE SIZE 10\n" +
  "  FOR ALL ENTRIES IN lt_input \n" +
  "  WHERE field = lt_input-field.",
];

statementType(tests, "SELECT loop", Statements.SelectLoop);