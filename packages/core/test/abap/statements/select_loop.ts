import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
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
  "SELECT * FROM cds_view( param2 = @lv_val2, param = @lv_val1 ).",
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

  "SELECT field1 field2\n" +
  "  APPENDING CORRESPONDING FIELDS OF TABLE gt_data\n" +
  "  PACKAGE SIZE 10 FROM ztable\n" +
  "  FOR ALL ENTRIES IN lt_input \n" +
  "  WHERE field = lt_input-field.",

  `
  SELECT DISTINCT (sdf)
  FROM (sdf)
  UP TO lv_limit ROWS
  INTO <record>
  WHERE (sdf)
  GROUP BY (sdf)
  HAVING (sdf)
  ORDER BY (sdf).`,

  `SELECT * from mara INTO TABLE @<lt_mara> PACKAGE SIZE @lv_pack.`,

  `SELECT blah FROM (db_table_name) INTO @tree WHERE (t_where_clause_blah).`,
  `SELECT DISTINCT * FROM (db_table_name) INTO @tree WHERE (t_where_clause_blah).`,
  `SELECT DISTINCT blah FROM (db_table_name) INTO @tree WHERE (t_where_clause_blah).`,
  `SELECT DISTINCT blah, blah_blah FROM (db_table_name) INTO @tree WHERE (t_where_clause_blah).`,
  `SELECT key_property, \\_path-expression FROM cds_view INTO @DATA(result).`,
  `SELECT key_property, \\_path-expression AS path FROM cds_view INTO @DATA(result).`,
  `SELECT aaa, \\_association-shortText AS ShortText FROM cds_view INTO @DATA(var).`,

  `SELECT vbeln, vbtyp,
  CASE
    WHEN auart = 'ZAMA' THEN @lc_name1
    WHEN auart = 'ZACR' THEN @lc_name2
   ELSE @lc_name3
 END AS ernam
 FROM vbak
  INTO @DATA(ls_vbak2).`,

  `SELECT field1 field2
    INTO CORRESPONDING FIELDS OF TABLE lt_http
    FROM ztab PACKAGE SIZE 2500
    WHERE status not BETWEEN 200 and 299
    and status <> 0
    AND bar IN i_bar.`,

  `SELECT * FROM t100 WHERE ( msgnr BETWEEN '001' AND '010' OR msgnr = '050' ).`,
  `SELECT * FROM t100 WHERE ( msgnr BETWEEN '001' AND '010' OR msgnr = '050').`,
  `SELECT FROM zsdfsd FIELDS @abap_true WHERE name = @sdf INTO @DATA(dddsf) UP TO 1 ROWS.`,

  `SELECT field1 INTO CORRESPONDING FIELDS OF TABLE li_tab FROM dbtab
  PACKAGE SIZE 2500
  WHERE foo IN bar
  %_HINTS ORACLE 'sdfsdf'.`,

];

statementType(tests, "SELECT loop", Statements.SelectLoop);