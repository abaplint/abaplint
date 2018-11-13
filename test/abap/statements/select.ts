import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

let tests = [
  "SELECT SINGLE objct FROM tobj INTO lv_objct WHERE objct = ms_item-obj_name.",
  "SELECT SINGLE * FROM tadir INTO rs_ta WHERE pgmid = iv_pg AND object = iv_ob AND obj LIKE lv_obj.",
  "SELECT * FROM tadir INTO CORRESPONDING FIELDS OF TABLE rt_tadir WHERE devclass = iv_package ORDER BY PRIMARY KEY.",
  "SELECT COUNT(*) FROM reposrc WHERE progname = <ls_tadir>-obj_name AND r3state = 'A'.",
  "SELECT ext~clsname FROM vseoextend AS ext INTO TABLE lt_plugin_class WHERE ext~refclsname = 'sdf' AND ext~version = '1'.",
  "SELECT SINGLE cdat udat cnam FROM reposrc INTO (lv_cdat, lv_udat, lv_cnam) WHERE progname = <ls_result>-sobjname.",
  "SELECT * FROM (c_tabname) INTO TABLE rt_content.",
  "SELECT name FROM cross INTO TABLE lt_cross WHERE ( type = '3' OR type = 'N' ) AND name = lt_name-table_line.",
  "SELECT name FROM cross INTO TABLE lt_cross FOR ALL ENTRIES IN lt_name WHERE name = lt_name-table_line.",
  "SELECT e070~trkorr as4user FROM e070 INNER JOIN e071 ON e070~trkorr = e071~trkorr INTO TABLE gt_objects.",
  "SELECT COUNT( * ) FROM dd08l WHERE arbgb = <ls_t100>-arbgb.",
  "SELECT * INTO TABLE gt_sbook[] FROM sbook UP TO 10 ROWS.",
  "SELECT zfoo~bar zbar~foo INTO TABLE rt_data FROM zfoo JOIN zbar ON field1 = field1 FOR ALL " +
    "ENTRIES IN it_matnr WHERE blah = lv_value.",
  "SELECT COUNT( * ) INTO rv_count FROM foo INNER JOIN bar ON bar~field = foo~field WHERE mat_id IN it_mat_id.",
  "SELECT name INTO TABLE lt_icon FROM icon WHERE name IN s_icon ORDER BY name.",
  "SELECT * UP TO 2 ROWS FROM t005t INTO TABLE lt_test.",
  "SELECT * FROM t006a APPENDING CORRESPONDING FIELDS OF TABLE lt_texts WHERE spras = sy-langu AND msehi = 'ASDF'.",
  "SELECT COUNT(*) INTO dbcount FROM vbak WHERE (where_clause).",
  "SELECT t1~ebeln t1~ebelp FROM eket AS t1 JOIN eket AS t2 ON t1~ebeln = t2~ebeln AND t1~ebelp = t2~ebelp \n" +
    "INTO CORRESPONDING FIELDS OF TABLE rt_data.",
  "SELECT COUNT(*) FROM /bobf/act_conf WHERE name = 'ZFOO'.",
  "SELECT * FROM zfoobar CLIENT SPECIFIED INTO TABLE rt_data WHERE mandt = '111'.",
  "SELECT SINGLE FOR UPDATE * FROM ZFOOBAR WHERE NAME_ID = lv_name.",
  "SELECT * FROM zfoo BYPASSING BUFFER INTO TABLE lt_table WHERE foo = lv_bar.",
  "SELECT SINGLE MAX( version ) FROM zfoo INTO lv_version.",
  "SELECT SINGLE MAX( version ) FROM zfoo INTO lv_version BYPASSING BUFFER WHERE " +
    "expression = ls_foobar-expression AND ( moo = 'A' OR boo = 'I' ).",
  "SELECT (lv_fields) FROM (gc_table) INTO CORRESPONDING FIELDS OF TABLE <lt_moo> " +
    "FOR ALL ENTRIES IN it_salesdoc_header WHERE foo = bar-foo.",
  "SELECT * FROM zfoo INTO TABLE lt_tab WHERE SPRAS IN (SY-LANGU,'E') AND MENU EQ 'BAR'.",
  "select foo~bname bar~name_first into table lt_table from foo left outer join bar on foo~mandt = bar~mandt and foo~bname = bar~bname.",
  "SELECT SINGLE node_key FROM snwd_bpa INTO @DATA(node_key).",
  "SELECT SINGLE node_key FROM snwd_bpa INTO @DATA(node_key) WHERE bp_id = @lv_bp_id.",

  "SELECT SINGLE * FROM sflight INTO CORRESPONDING FIELDS OF @return WHERE carrid = @i_flight_number.",
  "SELECT SINGLE * FROM sflight INTO @return WHERE carrid = @i_flight_number.",
  "SELECT SINGLE carrid, connid FROM sflight INTO @return.",
  "SELECT SINGLE carrid, connid, fldate FROM sflight INTO CORRESPONDING FIELDS OF @return WHERE carrid = @i_flight_number.",
  "SELECT SINGLE carrid, connid, fldate FROM sflight INTO CORRESPONDING FIELDS OF @DATA(return) WHERE carrid = @i_flight_number.",

  "SELECT * FROM zags_objects INTO TABLE @DATA(rt_list) WHERE repo = '345' ##SELECT_FAE_WITH_LOB[DATA_RAW].",

  "SELECT marc~matnr marc~werks marc~herkl\n" +
  "       mara~ntgew mara~gewei marc~beskz\n" +
  "  FROM marc JOIN mara ON marc~matnr = mara~matnr\n" +
  "  INTO TABLE rt_data\n" +
  "  FOR ALL ENTRIES IN it_matnr\n" +
  "  WHERE mara~matnr = it_matnr-matnr\n" +
  "  AND marc~werks = iv_werks.",

  "SELECT * INTO CORRESPONDING FIELDS OF TABLE lt_list\n" +
  "  FROM ( foo LEFT JOIN bar ON foo~boo = bar~car )\n" +
  "  UP TO lv_rows ROWS\n" +
  "  WHERE foo~blah IN lt_blah\n" +
  "  AND   foo~sdf IN lt_sdf.",

  "select unit FROM zfoobar INTO TABLE lt_tab \n" +
  "  UP TO lv_max ROWS\n" +
  "  WHERE dest_name IN lv_dest\n" +
  "  and ( unit = asdf\n" +
  "  OR    unit = fooo )\n" +
  "  GROUP BY unit_id.",

  "SELECT foo bar FROM ztab AS t\n" +
  "  INTO CORRESPONDING FIELDS OF TABLE result\n" +
  "  WHERE lang = lv_lang\n" +
  "  AND EXISTS ( SELECT * FROM zother AS s\n" +
  "  WHERE s~type = t~type AND field = 'X' ).",

  "SELECT * FROM zfoo \n" +
  "  UP TO 1000 ROWS \n" +
  "  INTO TABLE lt_result \n" +
  "  WHERE name = iv_name\n" +
  "  AND moo NOT IN ( SELECT msgnr FROM zbar\n" +
  "  WHERE name = iv_name ).",

  "select count(*) into (count) from ztab where bar is not null.",
  "SELECT num MAX( count ) COUNT( * ) INTO TABLE lt_tab FROM zfoo.",
  "SELECT COUNT( DISTINCT id ) FROM zfoo INTO lv_cnt.",
  "SELECT SINGLE id FROM ztab connection (lv_con) INTO lv_id.",
  "SELECT SUM( value ) FROM table INTO lv_count.",
  "SELECT carrid, connid FROM sflight INTO CORRESPONDING FIELDS OF TABLE @flight FOR ALL ENTRIES IN @carriers.",
  "SELECT SINGLE blah INTO lv_blah FROM dbtable WHERE posid = foo-bar AND field IN ( '02', '30' ).",
  "SELECT matnr, werks FROM ztable INTO TABLE @DATA(lt_result) WHERE matnr IN @s_matnr AND werks IN @s_werks.",
  "select posnr min( edatu ) into table li_vbep from vbep where vbeln = li_vbbe-vbeln and wmeng > 0 group by vbeln posnr.",

  "SELECT SINGLE ebeln ebelp\n" +
  "  INTO ( lv_ebeln , lv_ebeln )\n" +
  "  FROM ekpo\n" +
  "  BYPASSING BUFFER\n" +
  "  WHERE ebeln = lv_ebeln\n" +
  "  AND matnr = is_data-matnr\n" +
  "  AND lgort = is_data-lgort.",

  // todo
  /*
  "SELECT * FROM ztable\n" +
  "  INTO CORRESPONDING FIELDS OF TABLE gt_table\n" +
  "  WHERE group = gv_group\n" +
  "  AND matkl <= gs_header-matkl\n" +
  "  AND version IN  ('', g_header-version)\n" +
  "  AND portal  IN ('', g_portal(5))\n" +
  "  ORDER BY field1 DESCENDING\n" +
  "  field2 DESCENDING.",
*/

  "SELECT * FROM /space/table INTO TABLE lt_result\n" +
  "  WHERE field1 = value\n" +
  "  AND ( field4 = 'AA' OR field4 = 'BB' )\n" +
  "  AND field2 => gv_moo\n" +
  "  AND field3 <= gv_bar\n" +
  "  ORDER BY field1 field2 DESCENDING.",

  "SELECT * FROM ztable\n" +
  "  UP TO @lv_count ROWS\n" +
  "  INTO TABLE @DATA(lt_data)\n" +
  "  WHERE status = ' '\n" +
  "  ORDER BY change ASCENDING.",

  // todo
  /*
  "SELECT SINGLE field1, field2\n" +
  "  INTO (@<ls_data>-field1, @<ls_data>-field2)\n" +
  "  FROM ztable\n" +
  "  WHERE matnr = @<ls_data>-matnr\n" +
  "  AND werks = @<ls_data>-werks.",
*/

  "SELECT field FROM table INTO TABLE @DATA(lt_result) WHERE moo IN ( @gc_foo , @gc_bar ).",
  "SELECT kunnr APPENDING CORRESPONDING FIELDS OF TABLE lt_record FROM tab WHERE field = a_field.",
  "SELECT pernr FROM pa0002 INTO TABLE lt_pernr UP TO 100 ROWS WHERE pernr = SOME ( select pernr FROM pa9510 ).",
  "SELECT * FROM table INTO TABLE lt_tab WHERE field LIKE search ESCAPE '#'.",
  "SELECT * FROM table INTO TABLE lt_tab %_HINTS ORACLE 'FIRST_ROWS'.",
  "SELECT SINGLE FROM table FIELDS field INTO @DATA(lv_field).",
  "SELECT * FROM cds_view( param2 = @lv_val2, param = @lv_val1 ).",
  "SELECT SINGLE @abap_true FROM dd03l INTO @DATA(lv_exists) WHERE tabname = @lv_tabname AND as4local = 'A'.",
  "SELECT field1, field2 FROM ztab INTO TABLE @DATA(lt_result) WHERE field = @lv_field ORDER BY field1, field2.",
  "SELECT field FROM tab INTO TABLE @rt_delta WHERE clas IN ( 'VALUE1' , 'VALUE2' ) ORDER BY clas.",
  "SELECT SINGLE a, b INTO (@ls_foo-b, @ls_foo-a) FROM table.",
];

statementType(tests, "SELECT", Statements.Select);