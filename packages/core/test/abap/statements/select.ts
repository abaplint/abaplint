/* eslint-disable max-len */
import {statementType, statementVersion, statementVersionOk, statementVersionFail, statementExpectFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Version} from "../../../src/version";

const tests = [
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
  "SELECT obj_name FROM tadir INTO TABLE lt_tadir WHERE devclass IN ( SELECT devclass FROM tadir WHERE object = 'PROG' ).",
  "SELECT * UP TO 2 ROWS FROM t005t INTO TABLE lt_test.",
  "SELECT * FROM t006a APPENDING CORRESPONDING FIELDS OF TABLE lt_texts WHERE spras = sy-langu AND msehi = 'ASDF'.",
  "SELECT COUNT(*) INTO dbcount FROM vbak WHERE (where_clause).",
  "SELECT t1~ebeln t1~ebelp FROM eket AS t1 JOIN eket AS t2 ON t1~ebeln = t2~ebeln AND t1~ebelp = t2~ebelp \n" +
    "INTO CORRESPONDING FIELDS OF TABLE rt_data.",
  "SELECT COUNT(*) FROM /bobf/act_conf WHERE name = 'ZFOO'.",
  "SELECT * FROM zfoobar CLIENT SPECIFIED INTO TABLE rt_data WHERE mandt = '111'.",
  "SELECT SINGLE FOR UPDATE * FROM ZFOOBAR WHERE NAME_ID = lv_name.",
  "SELECT SINGLE FOR UPDATE * FROM ztab WHERE k = @lv INTO @DATA(lv) CONNECTION (lv_con).",
  "SELECT SINGLE FOR UPDATE * FROM ztab WHERE k = @lv INTO @lv2 CONNECTION (lv_con).",
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
  "SELECT AVG( value ) FROM ztable INTO lv_avg.",
  "SELECT AVG( DISTINCT value ) FROM ztable INTO lv_avg.",
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

  "SELECT SINGLE field1, field2\n" +
  "  INTO (@<ls_data>-field1, @<ls_data>-field2)\n" +
  "  FROM ztable\n" +
  "  WHERE matnr = @<ls_data>-matnr\n" +
  "  AND werks = @<ls_data>-werks.",

  "SELECT field FROM table INTO TABLE @DATA(lt_result) WHERE moo IN ( @gc_foo , @gc_bar ).",
  "SELECT kunnr APPENDING CORRESPONDING FIELDS OF TABLE lt_record FROM tab WHERE field = a_field.",
  "SELECT pernr FROM pa0002 INTO TABLE lt_pernr UP TO 100 ROWS WHERE pernr = SOME ( select pernr FROM pa9510 ).",
  "SELECT * FROM table INTO TABLE lt_tab WHERE field LIKE search ESCAPE '#'.",
  "SELECT * FROM table INTO TABLE lt_tab %_HINTS ORACLE 'FIRST_ROWS'.",
  "SELECT foo INTO TABLE gt_result FROM ztable %_HINTS ORACLE 'ORDERED' ORACLE 'USE_NL(&table2&)'.",
  "SELECT * FROM ztab INTO TABLE @DATA(lt_r) %_HINTS HDB @lv_hint DB2 @lv_hint ORACLE @lv_hint.",
  "SELECT * FROM ztab INTO TABLE @DATA(lt_r) %_HINTS HDB lv_hint DB2 lv_hint.",
  "SELECT * FROM ztab INTO TABLE @DATA(lt_r) %_HINTS HDB '&prefer_join 0&' HDB '&prefer_union_all 1&'.",
  "SELECT * FROM ztab INTO TABLE @DATA(lt_r) %_HINTS ADABAS go_hints->adabas AS400 go_hints->as400 HDB go_hints->hdb.",
  "SELECT SINGLE FROM table FIELDS field INTO @DATA(lv_field).",
  "SELECT SINGLE @abap_true FROM dd03l INTO @DATA(lv_exists) WHERE tabname = @lv_tabname AND as4local = 'A'.",
  "SELECT field1, field2 FROM ztab INTO TABLE @DATA(lt_result) WHERE field = @lv_field ORDER BY field1, field2.",
  "SELECT field FROM tab INTO TABLE @rt_delta WHERE clas IN ( 'VALUE1' , 'VALUE2' ) ORDER BY clas.",
  "SELECT SINGLE a, b INTO (@ls_foo-b, @ls_foo-a) FROM table.",
  "SELECT SINGLE 'X' FROM ztable INTO @DATA(lv_exist) WHERE field = 'F'.",
  "SELECT SINGLE field INTO lv_total FROM ztab WHERE invts = ( SELECT MIN( invts ) FROM table2 WHERE field = lv_value ).",
  "SELECT SINGLE field FROM ztable WHERE name = @( 'sdf' ) INTO @DATA(foo1).",
  "SELECT FROM ztab FIELDS fieldname INTO TABLE @DATA(lt_result).",
  "SELECT SINGLE FROM ztab FIELDS fieldname INTO @DATA(lt_result).",
  "SELECT SINGLE FOR UPDATE FROM ztab FIELDS fieldname INTO @DATA(lt_result).",

  "SELECT field\n" +
  "  INTO TABLE @DATA(lt_result1)\n" +
  "  FROM ( ( tab1\n" +
  "  INNER JOIN tab2 ON tab1~key = tab2~key )\n" +
  "  INNER JOIN tab3 ON tab1~key = tab3~key ) WHERE foo = bar.",

  "SELECT field\n" +
  "  INTO TABLE @DATA(lt_result1)\n" +
  "  FROM ( ( tab1\n" +
  "  INNER JOIN tab2 ON tab1~key = tab2~key )\n" +
  "  INNER JOIN tab3 ON tab1~key = tab3~key ).",

  "SELECT SINGLE * FROM *moo WHERE foo = bar.",
  "SELECT SINGLE * FROM ztable WHERE host = @lv_host INTO @DATA(ls_config).",
  "SELECT SINGLE * FROM ztable WHERE lower( host ) = @lv_host INTO @DATA(ls_config).",
  "SELECT bname, bcode FROM usr02 GROUP BY bname, bcode INTO TABLE @DATA(result).",
  `SELECT f FROM t1 INNER JOIN ( t2 ) ON t1~k = t2~k INTO TABLE @DATA(lt_r).`,
  `SELECT f FROM t1 INNER JOIN ( t2 AS x ) ON t1~k = x~k INTO TABLE @DATA(lt_r).`,
  `SELECT f FROM t1 LEFT OUTER JOIN ( t2 LEFT JOIN t3 ON t2~k = t3~k ) ON t1~k = t2~k INTO TABLE @DATA(lt_r).`,
  `SELECT f FROM t1 LEFT OUTER JOIN ( ( t2 INNER JOIN t3 ON t2~k = t3~k ) LEFT JOIN t4 ON t3~k = t4~k ) ON t1~k = t2~k INTO TABLE @DATA(lt_r).`,
  `SELECT f FROM t1 WHERE f IN ( SELECT f FROM t1 JOIN ( t2 JOIN t3 ON t2~k = t3~k ) ON t1~k = t2~k ) INTO TABLE @DATA(lt_r).`,
  `SELECT f INTO TABLE @lt CONNECTION (lv_con) FROM t1.`,
  `SELECT f INTO TABLE @lt CONNECTION (lv_con) FROM ( t1 JOIN t2 ON t1~k = t2~k ).`,
  `SELECT f INTO CORRESPONDING FIELDS OF TABLE @lt CONNECTION (lv_con) FROM ( ( ( t1 JOIN t2 ON t1~k = t2~k ) LEFT OUTER JOIN t3 ON t1~k = t3~k ) LEFT OUTER JOIN t4 ON t1~k = t4~k ) WHERE lv = lv2.`,
  `SELECT f FROM ( t1 INNER JOIN t2 ON t1~k = t2~k ) INTO TABLE @lt CONNECTION (lv_con) WHERE k = @lv.`,

  `SELECT *
FROM /abc/def_c_clearing_history(
  p_language     = @sy-langu,
  p_company_code = @ms_document-company_code
)
INTO CORRESPONDING FIELDS OF TABLE @mt_journal
ORDER BY PRIMARY KEY ##DB_FEATURE_MODE[VIEWS_WITH_PARAMETERS].`,

  `SELECT SINGLE * FROM @lt_fields AS SemanticKeyAlias WHERE name = @ls_semantic_key INTO @DATA(result).`,

  `SELECT DISTINCT MAX( moo ) FROM ztable INTO ev_max WHERE foo = bar.`,

  `select count(*) as score from sdfsd where object = @object_id-object and obj_name = @object_id-obj_name into @data(count).`,

  `SELECT SINGLE foo FROM bar WHERE column IN (sdf, char-).`,

  `SELECT DISTINCT roosourcet~oltpsource,
  roosourcet~txtsh,
  roosourcet~txtmd,
  roosourcet~txtlg INTO TABLE @DATA(lt_roosourcet)
  FROM roosourcet JOIN /xyz/ztest ON /xyz/ztest~oltpsource = roosourcet~oltpsource
  FOR ALL ENTRIES IN @lt_active
  WHERE roosourcet~oltpsource = @lt_active-oltpsource
  AND roosourcet~objvers = 'A'
  AND roosourcet~langu = 'E'.`,

  `
  SELECT DISTINCT b~partner, c~name_first, c~name_last, c~name_org1, c~name_grp1, a~mc_city1, a~post_code1, l~vendor, b~iban
  FROM but0bk AS b
  INNER JOIN but000 AS c
    ON b~partner = c~partner
  INNER JOIN but020 AS d
    ON b~partner = d~partner
  INNER JOIN adrc AS a
    ON d~addrnumber = a~addrnumber
  INNER JOIN cvi_vend_link AS l
    ON l~partner_guid = c~partner_guid
  WHERE b~iban = 'IBAN'
UNION DISTINCT
SELECT DISTINCT b~partner, c~name_first, c~name_last, c~name_org1, c~name_grp1, a~mc_city1, a~post_code1, l~vendor, t~iban
  FROM tiban AS t
  INNER JOIN but0bk AS b
    ON  t~banks = b~banks
    AND t~bankl = b~bankl
    AND t~bankn = b~bankn
    AND t~bkont = b~bkont
  INNER JOIN but000 AS c
    ON b~partner = c~partner
  INNER JOIN but020 AS d
    ON b~partner = d~partner
  INNER JOIN adrc AS a
    ON d~addrnumber = a~addrnumber
  INNER JOIN cvi_vend_link AS l
    ON l~partner_guid = c~partner_guid
  WHERE t~iban = 'IBAN'
  INTO TABLE @DATA(foo).`,

  `SELECT @zcl_class=>option-eq AS option, devclass AS low
    FROM tdevc
    INTO CORRESPONDING FIELDS OF TABLE @target.`,

  `SELECT * FROM cds_view WITH PRIVILEGED ACCESS WHERE test = @foo INTO CORRESPONDING FIELDS OF TABLE @rt_values.`,
  `SELECT foo, bar FROM dbtab WHERE id = @key-id AND name IS NOT INITIAL INTO TABLE @DATA(result).`,
  "SELECT COUNT( DISTINCT ( field ) ) FROM voided INTO @DATA(lv_result).",
  `SELECT SINGLE * FROM usr02 INTO @DATA(sdf) WHERE bname = @text-001.`,
  `SELECT SINGLE foo, bar FROM tab INTO (@lv_moo, @DATA(lv_bar)).`,
  `SELECT SINGLE FROM rfcdes FIELDS rfcdest WHERE rfcdest = @lv_rfcdes INTO @lv_rfcdes.`,
  `SELECT SINGLE FROM tadir FIELDS object, obj_name WHERE devclass = @co_package INTO @DATA(ls_object).`,

  `SELECT a~bar, c~*
    FROM bar AS a
    INNER JOIN moo AS b ON a~field1 = b~field2
    INNER JOIN sdf AS c ON c~field3 = b~field4
    INTO TABLE @DATA(lt_final).`,

  `SELECT SINGLE SUM( reserved + reserved ) FROM bar1 INTO @DATA(sdfsd1).`,
  `SELECT SINGLE SUM( reserved + reserved + reserved ) FROM bar1 INTO @DATA(sdfsd1).`,
  `SELECT SINGLE SUM( reserved - reserved ) FROM bar2 INTO @DATA(sdfsd2).`,
  `SELECT SINGLE SUM( reserved * reserved ) FROM bar3 INTO @DATA(sdfsd3).`,

  `SELECT CAST( dfsds AS CHAR( 8 ) ) AS sdf
  FROM dsfsd
  ORDER BY sdfd
  INTO TABLE @DATA(lt_data).`,

  `SELECT DISTINCT ( mestyp ) INTO CORRESPONDING FIELDS OF TABLE @lt_edimsg FROM edimsg.`,
  `SELECT ( mestyp ) INTO CORRESPONDING FIELDS OF TABLE @lt_edimsg FROM edimsg.`,

  `SELECT monster_number, name
    FROM ztmonster_header
    WHERE eas_days + sanity_percentage > 100
    INTO TABLE @DATA(old_sane_monster_list).`,

  `SELECT SINGLE 1 + 1 FROM ztab INTO @DATA(sdf).`,

  `SELECT 'SICF'              AS  main_object,
src~icf_name && src~icfparguid          AS main_obj_name,
src~icf_langu         AS language,
src~icf_docu          AS description,
'icfdocu' AS txttab
FROM icfdocu AS src
APPENDING CORRESPONDING FIELDS OF TABLE @ta_result
WHERE icf_docu IN @search_range
 AND icf_langu     LIKE @language.`,

  `SELECT kbetr * 1 FROM a950 INTO TABLE @tm_data.`,
  `SELECT kbetr * ( 1 ) FROM a950 INTO TABLE @tm_data.`,
  `SELECT kbetr * ( -1 ) FROM a950 INTO TABLE @tm_data.`,
//  `SELECT kbetr * ( 1 + 1 ) FROM a950 INTO TABLE @tm_data.`,

  `SELECT mwskz AS tax_code,
CASE shkzg
  WHEN 'H' THEN ABS( hwbas )
  WHEN 'S' THEN ABS( hwbas ) * -1
END AS tax_base_amount_lc
FROM bset
WHERE bukrs = @is_doc_key-company_code
ORDER BY tax_code
INTO CORRESPONDING FIELDS OF TABLE @lt_document_tax_data.`,

  `SELECT name, monster_number,
CAST( strength AS FLTP ) / CAST( sanity_percentage AS FLTP )
AS scariness_ratio
FROM z4t_monster_head
INTO TABLE @DATA(scariness_table).`,

  `SELECT SINGLE paymentterms
FROM z4tmonster_bdata
INTO @DATA(payment_terms)
WHERE ordernumber EQ @is_order_item-order_number
AND   itemnumber  EQ (
SELECT
coalesce( item~itemnumber , header~itemnumber )
FROM z4t_order_items
LEFT OUTER JOIN z4tmonster_bdata AS header
ON header~ordernumber = z4t_order_items~order_number AND
   header~itemnumber  = @lc_header_posnr
LEFT OUTER JOIN z4tmonster_bdata AS item
  ON item~ordernumber = z4t_order_items~order_number AND
     item~itemnumber  = z4t_order_items~order_item
WHERE z4t_order_items~order_number EQ @is_order_item-order_number
AND   z4t_order_items~order_item   EQ @is_order_item-order_item ).`,

  `SELECT
concat( monster_number, replace( sdf, dfdsfs , name ) )
AS monster_description,
length( weapon ) AS weapon_length
FROM z4t_monster_head
WHERE hat_size = @( helper_function->hat_size_of_the_day( ) )
INTO TABLE @DATA(evilized_monster_weapons).`,

  `SELECT * FROM /foo/bar INTO CORRESPONDING FIELDS OF TABLE lt_texts WHERE id = /foo/if_bar~key-id.`,
  `SELECT SINGLE * FROM t100 INTO sdf WHERE arbgb = lv_foo(2).`,
  `SELECT SINGLE matnr AS mara-matnr FROM mara INTO @ls_materiale.`,
  `SELECT SINGLE * FROM t100 INTO NEW @DATA(sdfs).`,

  `SELECT foobar~aufnr, foobar~objnr
    FROM foobar
    INNER JOIN cdhdr AS h ON concat( @ls_mandt , foobar~aufnr ) = h~objectid
    WHERE foobar~aufnr IN @blah
    AND h~objectclas = 'ABC'
    INTO TABLE @gt_tab.`,

  `SELECT * INTO TABLE lt_but000
FROM but000
WHERE  but000~partner IN ('1000' , '2000' , '3000' ).`,

  `SELECT * FROM sdf WHERE tabname IN (@val, 'sdf') INTO TABLE @tab.`,

  `SELECT foo AS bar,
    CAST( SUM( CAST( field AS DEC( 10, 3 ) ) ) AS CHAR( 10 ) ) AS something
    FROM @it AS t1
    GROUP BY field1, field2
    INTO CORRESPONDING FIELDS OF TABLE @rt_load.`,

  `SELECT * FROM ztab INTO TABLE @DATA(lt) WHERE field IN ( @lc1,@lc2 ).`,
  `SELECT CAST( round( SUM( CAST( field AS DEC( 13, 3 ) ) ), 0 ) AS CHAR( 17 ) ) AS something FROM ztab INTO TABLE @DATA(lt).`,
  `SELECT SUM( DISTINCT f1 ) AS sum FROM usr01 INTO TABLE @DATA(itab).`,

  `SELECT * FROM edidc INTO TABLE tab
    WHERE ( ( credat = lv_date AND cretim >= lv_time )
    OR ( credat = lv_date AND cretim =< lv_time ) )
    AND mestyp = 'ASDF'.`,

  `SELECT FROM some_table
    FIELDS DISTINCT fieldname AS name
    INTO CORRESPONDING FIELDS OF TABLE @result.`,

  `SELECT field1, field2 FROM zfoo
    WHERE created_on IN @it_created_on
    ORDER BY mandt, created_on
    %_HINTS ORACLE 'INDEX(ZFOO~Y20)'
    INTO TABLE @lt_foo ##SUBRC_OK.`,

  `SELECT field1, field2 FROM zfoo
    WHERE created_on IN @it_created_on
    %_HINTS ORACLE 'INDEX(ZFOO~Y20)'
    INTO TABLE @lt_foo ##SUBRC_OK.`,

  `SELECT field1, field2 FROM zfoo
    %_HINTS ORACLE 'INDEX(ZFOO~Y20)'
    INTO TABLE @lt_foo ##SUBRC_OK.`,

  `SELECT field1, field2 FROM zfoo
    %_HINTS ORACLE 'INDEX(ZFOO~Y20)'
    INTO TABLE @lt_foo
    UP TO 100 ROWS ##SUBRC_OK. `,

  `select orig~id, orig~parentid,
     coalesce( refm~domainid, ref~domainid, orig~domainid ) as domainid,
     case when refm~id is not null then 4 else case when ref~id is not null then 5 end end as scope
     from      zorig    as orig
     left join zref     as ref  on orig~reff = ref~id
     appending table @join.`,

  `SELECT object FROM tadir WHERE @( strlen( 'asd' ) ) = 2 INTO TABLE @DATA(TEST).`,

  `SELECT SINGLE MAX( field )
     FROM /foo/gl_bar
     INTO @sdfsdf
     GROUP BY field.`,

  `SELECT *
     FROM /foo/bar
     WHERE fieldname = ( ( SELECT MAX( fieldname ) FROM /moo/foo ) )
     INTO CORRESPONDING FIELDS OF TABLE @/foo/cl_clas=>gt.`,

  `SELECT gla, \\_skat-txt50, indi
    FROM /foo/bar
    WHERE indi = @abap_false
    AND \\_skat-spras = @sy-langu
    AND field         = 'FOO'
    ORDER BY gla ASCENDING
    INTO TABLE @lt.`,

  `SELECT foo bar FROM ksml
    INTO TABLE lt
    GROUP BY foo bar
    HAVING count( * ) > 1.`,

  `SELECT MAX( f1 ) INTO TABLE @et FROM ztab WHERE f2 EQ iv HAVING NOT MAX( f1 ) IS NULL.`,

  `SELECT MAX( f1 ) INTO @wa FROM ztab WHERE f2 EQ iv HAVING MAX( f1 ) IS NOT NULL.`,

  `SELECT MIN( f1 ) MAX( f1 ) INTO ( ls-low , ls-high ) FROM ztab WHERE f2 IN it HAVING NOT MIN( f1 ) IS NULL AND NOT MAX( f1 ) IS NULL.`,

  `SELECT f1 SUM( f2 ) AS s1 SUM( f3 ) AS s2 FROM ztab INTO CORRESPONDING FIELDS OF TABLE @lt GROUP BY f1 HAVING SUM( f2 ) <> 0 OR SUM( f3 ) <> 0.`,

  `SELECT f1 SUM( ABS( f2 ) ) AS s1 MAX( f3 ) AS s2 INTO CORRESPONDING FIELDS OF TABLE @lt FROM ztab GROUP BY f1 HAVING SUM( ABS( f2 ) ) <> MAX( f3 ).`,

  `SELECT f1 FROM ztab GROUP BY f1 HAVING f1 IS NULL INTO TABLE @lt.`,

  `SELECT f1 INTO TABLE @lt FROM ztab AS t1 GROUP BY f1 HAVING f1 <= ( SELECT MAX( f1 ) FROM ztab AS t2 ).`,

  `SELECT f1 SUM( f2 ) AS s FROM ztab AS t1 GROUP BY f1 HAVING COUNT( * ) > ( SELECT COUNT( * ) FROM ztab2 WHERE f3 = SUM( t1~f2 ) ) INTO TABLE @lt.`,

  `SELECT f1 FROM ztab GROUP BY f1 HAVING COUNT( * ) >= ALL ( SELECT COUNT( * ) FROM ztab2 GROUP BY f2 ) INTO CORRESPONDING FIELDS OF TABLE @et.`,

  `SELECT f1 FROM ztab GROUP BY f1 HAVING f1 IN ( SELECT DISTINCT f2 FROM ztab2 WHERE f3 = f1 ) INTO TABLE @lt.`,

  `SELECT SINGLE COUNT( * ) INTO lv_cnt FROM ztab WHERE (lv_where) GROUP BY (lv_grp) HAVING COUNT( * ) > 1.`,

  `SELECT SINGLE (lv_fields) FROM ztab GROUP BY (lv_grp) HAVING (lv_having) INTO @wa.`,

  `SELECT SINGLE MAX( col ) INTO @wa FROM ztab CONNECTION (lv_con) WHERE col = @lv HAVING MAX( col ) IS NOT NULL.`,
  `SELECT SINGLE col INTO @lv FROM ztab CONNECTION (lv_con) WHERE col = @lv.`,

  `SELECT SINGLE * FROM t100 WHERE 'A' = t100~arbgb INTO @DATA(sdf).`,

  `SELECT
     abs( cast( wrbtr as fltp ) / cast( menge as fltp ) ) as price
     FROM sdfsdf
     INTO TABLE @sdf.`,

  `SELECT FROM table
      FIELDS SUM( qty )
      WHERE foo <> 'A'
      INTO @DATA(total).`,

  `SELECT vbelv, posnv,
    SUM( CASE vbtyp_n
       WHEN @zif=>ord
       THEN rfmng
       WHEN @zif=>ret
       THEN field
       ELSE 0
       END ) AS qty
     FROM vbfa
     WHERE vbelv EQ @ref
     GROUP BY vbelv, posnv
     INTO TABLE @DATA(lt_rows).`,

  `SELECT * FROM ztab APPENDING TABLE result
     FOR ALL ENTRIES IN tab
     WHERE matnr = tab-matnr
     %_HINTS HDB lv_hint.`,

  `SELECT b~/foo/bar, b~mc_name1
      FROM /foo/moo AS a
      INNER JOIN but000 AS b ON a~code = b~partner
      WHERE period IN @lr_uniqueid
      INTO TABLE @DATA(lt_tab).`,

  `SELECT COUNT(*) FROM /foo/bar AS A
      INNER JOIN moo AS B
        ON B~AABB = A~/foo/val
        INTO target
        WHERE B~SPRAS IN moo.`,

  `SELECT a~werks a~grund a~bwart a~matnr a~mblnr a~menge a~hwaer
    a~zeile a~dmbtr
             b~vkorg b~vtweg b~name1 b~stras b~pstlz b~ort01 b~land1
             b~regio
             c~mjahr c~bldat c~usnam
             d~meins
             e~ean11 e~mhdhb e~mhdlp
             f~zzges f~zset f~zrep f~zcat
             f~zsube
             g~zzav
        INTO CORRESPONDING FIELDS OF TABLE pt_masf
        FROM ( ( ( ( ( s584 AS a INNER JOIN t001w AS b ON a~werks = b~werks )
             INNER JOIN mkpf AS c ON a~mblnr = c~mblnr AND a~gjahr = c~mjahr )
             INNER JOIN mseg AS d ON a~mblnr = d~mblnr AND a~gjahr = d~mjahr AND a~zeile = d~zeile )
             INNER JOIN mara AS e ON a~matnr = e~matnr )
             INNER JOIN mvke AS f ON a~matnr = f~matnr AND b~vtweg =
             f~vtweg )
             LEFT OUTER JOIN s532 AS g ON a~ssour = g~ssour
                         AND a~vrsio = g~vrsio AND a~spmon = g~spmon
                         AND a~sptag = g~sptag AND a~spwoc = g~spwoc
                         AND a~spbup = g~spbup AND a~mblnr = g~mblnr
                         AND a~gjahr = g~mjahr AND a~budat = g~budat
                         AND a~zeile = g~zeile AND a~werks = g~werks
                         AND a~matnr = g~matnr AND a~bwart = g~bwart
                         AND a~grund = g~grund
       WHERE a~vrsio = '000'.`,

  `SELECT FROM I_Language
      FIELDS LanguageISOCode,
             \\_Text[ ONE TO ONE WHERE Language = @sy-langu ]-LanguageName
      ORDER BY LanguageISOCode
      INTO TABLE @DATA(languages).`,

  `SELECT
    FROM /foo/bar
    FIELDS (mv_sql_select)
    WHERE uuid = @mv__uuid
    AND \\_foo\\_bar-top IN @mt_top
    GROUP BY (mv_sql_group)
    INTO CORRESPONDING FIELDS OF TABLE @mt_result.`,

  `SELECT matnr,
               CASE @me->mode
                WHEN 'I' THEN 'I'
                WHEN 'D' THEN ' '
               END AS activity
        INTO TABLE @tab
        FROM ztab.`,

  `SELECT CAST( arbgb AS DATS ) AS foo FROM t100 INTO TABLE @DATA(sdf).`,
  `SELECT ( arbgb ) FROM t100 INTO TABLE @DATA(sdf).`,
  `SELECT ( arbgb ) AS bar FROM t100 INTO TABLE @DATA(sdf).`,
  `SELECT ( arbgb ), text AS bar FROM t100 INTO TABLE @DATA(sdf).`,
  `SELECT (lv_dyn(11)) FROM t100 INTO TABLE @DATA(sdf).`,
  `SELECT (lv_dyn+3(1)) FROM t100 INTO TABLE @DATA(sdf).`,
  `SELECT (lv_dyn+lv_off(lv_len)) FROM t100 INTO TABLE @DATA(sdf).`,
  `SELECT (go_obj->attr) FROM t100 INTO TABLE @DATA(sdf).`,
  `SELECT (ls_str-(lv_comp)) FROM t100 INTO TABLE @DATA(sdf).`,
  `SELECT DISTINCT 'I' AS sign, 'EQ' AS option, werks AS low
    FROM t001w
    APPENDING CORRESPONDING FIELDS OF TABLE @r_drive[]
    WHERE kunnr IN ( SELECT sdfsdf FROM ztab AS p
                       JOIN t001w AS t ON t~kunnr = p~sdfsdf ).`,

  `SELECT ( zzfoo && zzbar && 'XX' && zzmoo ) AS fieldname
    INTO TABLE @tab
    FROM ztab
    WHERE field = '01'
    ORDER BY field2.`,

  `SELECT name INTO TABLE @data(lt_icon) FROM icon WHERE ( name = 'sdf' ) ORDER BY name.`,

  `SELECT @( foo-head-bar-boo ) AS sdfsd,
     wakh~aktnr         AS moo
     FROM wakh
     WHERE wakh~aktnr IN @lr_aktnr
     INTO TABLE @tab.`,

  `SELECT DISTINCT knvp~kunn2 kna1~name1
  INTO TABLE out
  FROM knvp
  INNER JOIN *knvp
  ON knvp~kunnr = *knvp~kunnr
  AND *knvp~parvw = 'RG'
  INNER JOIN kna1
  ON kna1~kunnr = *knvp~kunn2
  WHERE knvp~parvw = 'RE'
  AND knvp~kunnr NE knvp~kunn2.`,

  `SELECT *
    FROM /foo/bar
    WHERE right( field, 12 ) IN @bar
    AND status = 'E'
    INTO TABLE @tab
    UP TO @pack_size ROWS.`,

  `SELECT DISTINCT ( a~matnr ),( a~werks ), a~mmsta, a~lgfsb
    INTO TABLE @pt_alv
    FROM marc AS a INNER JOIN zfoobar AS b
                           ON b~werks = a~werks
    WHERE a~matnr IN @s_matnr
      AND a~werks IN @s_cedi
      AND a~mmsta IN @s_mmsta
      AND a~lgfsb = @space.`,

  `SELECT CAST( CASE T1~_DATAAGING WHEN '00000000' THEN ' ' ELSE 'X' END AS CHAR ) AS XARCH FROM BSEG AS T1 INTO TABLE @DATA(lt_result).`,
  `SELECT CAST( CASE T1~FKBER_LONG WHEN ' ' THEN T1~FKBER ELSE T1~FKBER_LONG END AS CHAR ) AS FKBER ` +
  ` FROM BSEG AS T1 INTO TABLE @DATA(lt_result).`,
  `SELECT CASE col WHEN @abap_true THEN ( ' ' ) ELSE ( 'X' ) END AS flag FROM ztab INTO TABLE @DATA(lt_r).`,
  `SELECT CASE col WHEN '1' THEN ( 'Y' ) WHEN '0' THEN ( 'N' ) ELSE ( ' ' ) END AS val FROM ztab INTO TABLE @DATA(lt_r).`,
  `SELECT @class_name=>const_attr AS rec FROM ztab INTO TABLE @DATA(lt_r).`,
  `SELECT col FROM ztab WHERE col = @class_name=>const_attr INTO TABLE @DATA(lt_r).`,
  `SELECT col FROM ztab WHERE NOT col LIKE '/prefix_pattern' INTO TABLE @DATA(lt_r).`,
];

statementType(tests, "SELECT", Statements.Select);

statementType([
  `SELECT * BYPASSING BUFFER FROM ztab INTO TABLE @DATA(lt_r) WHERE col = @lv_v.`,
  `SELECT f1 BYPASSING BUFFER FROM ztab INTO TABLE @DATA(lt_r).`,
  `SELECT SINGLE * BYPASSING BUFFER FROM ztab INTO @wa WHERE col = @lv_v.`,
  `SELECT * FROM ztab BYPASSING BUFFER INTO TABLE @DATA(lt_r) WHERE col = @lv_v.`,
  `SELECT * FROM ztab BYPASSING BUFFER WHERE col = @lv_v INTO TABLE @DATA(lt_r).`,
  `SELECT * FROM ztab BYPASSING BUFFER INTO TABLE @DATA(lt_r) ORDER BY col.`,
  `SELECT * FROM ztab BYPASSING BUFFER FOR ALL ENTRIES IN @lt_fae WHERE col = @lt_fae-col INTO TABLE @DATA(lt_r).`,
  `SELECT * FROM ztab CLIENT SPECIFIED BYPASSING BUFFER INTO TABLE @DATA(lt_r) WHERE col = @lv_v.`,
  `SELECT * FROM ztab CLIENT SPECIFIED BYPASSING BUFFER WHERE col = @lv_v INTO TABLE @DATA(lt_r).`,
  `SELECT * FROM ztab INTO TABLE @DATA(lt_r) BYPASSING BUFFER WHERE col = @lv_v.`,
  `SELECT * FROM ztab INTO TABLE @DATA(lt_r) BYPASSING BUFFER ORDER BY col.`,
  `SELECT * FROM ztab INTO CORRESPONDING FIELDS OF TABLE @lt_r BYPASSING BUFFER WHERE col = @lv_v.`,
  `SELECT * FROM ztab UP TO 10 ROWS BYPASSING BUFFER INTO TABLE @DATA(lt_r).`,
  `SELECT * FROM ztab UP TO 10 ROWS BYPASSING BUFFER WHERE col = @lv_v INTO TABLE @DATA(lt_r).`,
  `SELECT * FROM ztab CLIENT SPECIFIED BYPASSING BUFFER UP TO 10 ROWS WHERE col = @lv_v INTO TABLE @DATA(lt_r).`,
  `SELECT * UP TO 10 ROWS INTO TABLE @DATA(lt_r) BYPASSING BUFFER FROM ztab WHERE col = @lv_v.`,
  `SELECT * UP TO 10 ROWS APPENDING CORRESPONDING FIELDS OF TABLE @lt_r BYPASSING BUFFER FROM ztab WHERE col = @lv_v.`,
  `SELECT * INTO CORRESPONDING FIELDS OF TABLE @lt_r BYPASSING BUFFER FROM ztab INNER JOIN ztab2 ON ztab~k = ztab2~k WHERE ztab~col = @lv_v.`,
  `SELECT col INTO CORRESPONDING FIELDS OF TABLE @lt_r BYPASSING BUFFER FROM ztab FOR ALL ENTRIES IN @lt_fae WHERE col = @lt_fae-col.`,
  `SELECT * FROM ztab CONNECTION (lv_con) UP TO 10 ROWS INTO TABLE @DATA(lt_r) BYPASSING BUFFER WHERE col = @lv_v.`,
  `SELECT * FROM ztab CONNECTION (lv_con) UP TO 10 ROWS APPENDING CORRESPONDING FIELDS OF TABLE @lt_r BYPASSING BUFFER WHERE col = @lv_v.`,
], "SELECT BYPASSING BUFFER positional variants", Statements.Select);

const versions = [
  {abap: "SELECT field, uuid( ) AS uuid FROM table INTO TABLE @DATA(result).", ver: Version.v754},
  {abap: "SELECT SINGLE abs( field ) FROM ztable INTO @DATA(sdfsd).", ver: Version.v740sp05},
  {abap: `SELECT FROM ztable
    FIELDS
    CASE status
      WHEN '1' THEN '2'
      ELSE '3'
    END
  INTO TABLE @DATA(sdfsd).`, ver: Version.v750},
  {abap: `SELECT field1, field2, division( 0, 1, 2 ) AS r1, division( 100, 2, 2 ) AS r2, division( -100, 5, 0 ) AS r3 FROM ztable INTO TABLE @DATA(result).`, ver: Version.v751},
  {abap: `SELECT field1, division( field2, 2, 2 ) AS r1, division( field2, -5, 1 ) AS r2 FROM ztable INTO TABLE @DATA(result).`, ver: Version.v751},
  {abap: `SELECT field1, division( 100, field2, 2 ) AS r1 FROM ztable WHERE field3 = @lv_val INTO TABLE @DATA(result).`, ver: Version.v751},
  {abap: `SELECT t1~field1, t1~field2, division( t1~field3, t2~field3, 2 ) AS ratio FROM ztable AS t1 INNER JOIN ztable2 AS t2 ON t1~field1 = t2~field1 ORDER BY t1~field1 INTO TABLE @DATA(result).`, ver: Version.v751},
  {abap: `SELECT t1~field1, division( t1~field2, t2~field2, 2 ) AS d FROM ztable AS t1 LEFT OUTER JOIN ztable2 AS t2 ON t1~field1 = t2~field1 WHERE division( t1~field2, t2~field2, 2 ) IS NOT NULL INTO TABLE @DATA(result).`, ver: Version.v751},
  {abap: `SELECT t1~field1, division( t1~field2, t2~field2, 2 ) AS d FROM ztable AS t1 LEFT OUTER JOIN ztable2 AS t2 ON t1~field1 = t2~field1 WHERE division( t1~field2, t2~field2, 2 ) IS NULL INTO TABLE @DATA(result).`, ver: Version.v751},
  {abap: `SELECT col FROM ztab USING CLIENT @lv_mandt INTO TABLE @DATA(lt_r).`, ver: Version.v740sp05},
  {abap: `SELECT col FROM ztab ORDER BY col INTO TABLE @DATA(lt_r) UP TO 10 ROWS OFFSET @lv_off.`, ver: Version.v751},
  {abap: `SELECT col1 + col2 AS first , COUNT(*) AS second FROM ztab GROUP BY col1 + col2 ORDER BY first INTO TABLE @DATA(lt_r).`, ver: Version.v740sp05},
  {abap: `SELECT - col AS neg , COUNT(*) AS cnt FROM ztab GROUP BY - col INTO TABLE @DATA(lt_r).`, ver: Version.v740sp05},
  {abap: `SELECT CASE WHEN col = 0 THEN 0 WHEN col IS NOT NULL THEN 1 END AS grp , COUNT(*) FROM ztab GROUP BY CASE WHEN col = 0 THEN 0 WHEN col IS NOT NULL THEN 1 END INTO TABLE @DATA(lt_r).`, ver: Version.v740sp05},
  {abap: `SELECT 1 + CASE WHEN col < 2 THEN 1 END AS grp , COUNT(*) FROM ztab GROUP BY 1 + CASE WHEN col < 2 THEN 1 END INTO TABLE @DATA(lt_r).`, ver: Version.v740sp05},
  {abap: `SELECT col FROM ztab GROUP BY REPLACE( CONCAT( col , col2 ) , col3 , col4 ) INTO TABLE @DATA(lt_r).`, ver: Version.v750},
  {abap: `SELECT col1 + col2 AS first , col3 , COUNT(*) AS cnt FROM ztab GROUP BY col1 + col2 , col3 INTO TABLE @DATA(lt_r).`, ver: Version.v740sp05},
  {abap: `SELECT - col AS neg , col2 , COUNT(*) AS cnt FROM ztab GROUP BY - col , col2 INTO TABLE @DATA(lt_r).`, ver: Version.v740sp05},
  {abap: `SELECT @lv_const AS c , col , COUNT(*) AS cnt FROM ztab GROUP BY @lv_const , col INTO TABLE @DATA(lt_r).`, ver: Version.v740sp05},
];

statementVersion(versions, "SELECT", Statements.Select);

statementVersionOk([
  {abap: `SELECT * FROM ztab1 \\_assoc1 AS r WHERE col4 = @sy-uname INTO TABLE @result.`, ver: Version.v740sp05},
  {abap: `SELECT * FROM ztab1\\_assoc1 AS r WHERE col4 = @sy-uname INTO TABLE @result.`, ver: Version.v740sp05},
  {abap: `SELECT * FROM ztab1 \\_assoc1 \\_assoc2 AS r WHERE col4 = @sy-uname INTO TABLE @result.`, ver: Version.v740sp05},
  {abap: `SELECT * FROM ztab1( col1 = 'AB', col2 = 3 ) \\_assoc1 AS r WHERE col4 = @sy-uname INTO TABLE @result.`, ver: Version.v751},
  {abap: `SELECT * FROM ztab1 \\_assoc1( col1 = 'AB', col2 = 3 ) AS r WHERE col4 = @sy-uname INTO TABLE @result.`, ver: Version.v751},
  {abap: `SELECT * FROM ztab1\\_assoc1( col1 = 'AB', col2 = 3 ) AS r WHERE col4 = @sy-uname INTO TABLE @result.`, ver: Version.v751},
  {abap: `SELECT * FROM ztab1 \\_assoc1[ col4 = @sy-uname ] AS r WHERE col4 = @sy-uname INTO TABLE @result.`, ver: Version.v751},
  {abap: `SELECT * FROM ztab1 \\_assoc1[ WHERE col4 = @sy-uname ] AS r INTO TABLE @result.`, ver: Version.v751},
  {abap: `SELECT * FROM ztab1 \\_assoc1[ INNER ] AS r WHERE col4 = @sy-uname INTO TABLE @result.`, ver: Version.v751},
  {abap: `SELECT * FROM ztab1 \\_assoc1[ LEFT OUTER ] AS r WHERE col4 = @sy-uname INTO TABLE @result.`, ver: Version.v751},
  {abap: `SELECT * FROM ztab1 \\_assoc1[ RIGHT OUTER ] AS r WHERE col4 = @sy-uname INTO TABLE @result.`, ver: Version.v751},
  {abap: `SELECT * FROM ztab1 \\_assoc1[ ONE TO ONE ] AS r WHERE col4 = @sy-uname INTO TABLE @result.`, ver: Version.v751},
  {abap: `SELECT * FROM ztab1 \\_assoc1[ MANY TO ONE ] AS r WHERE col4 = @sy-uname INTO TABLE @result.`, ver: Version.v751},
  {abap: `SELECT * FROM ztab1 \\_assoc1[ ONE TO MANY ] AS r WHERE col4 = @sy-uname INTO TABLE @result.`, ver: Version.v751},
  {abap: `SELECT * FROM ztab1 \\_assoc1[ MANY TO MANY ] AS r WHERE col4 = @sy-uname INTO TABLE @result.`, ver: Version.v751},
  {abap: `SELECT * FROM ztab1 \\_assoc1[ EXACT ONE TO ONE ] AS r WHERE col4 = @sy-uname INTO TABLE @result.`, ver: Version.v751},
  {abap: `SELECT * FROM ztab1 \\_assoc1[ INNER WHERE col4 = @sy-uname ] AS r INTO TABLE @result.`, ver: Version.v751},
  {abap: `SELECT * FROM ztab1 \\_assoc1[ LEFT OUTER WHERE col4 = @sy-uname ] AS r INTO TABLE @result.`, ver: Version.v751},
  {abap: `SELECT * FROM ztab1 \\_assoc1[ ONE TO ONE WHERE col4 = @sy-uname ] AS r INTO TABLE @result.`, ver: Version.v751},
  {abap: `SELECT * FROM ztab1 \\_assoc1[ MANY TO ONE WHERE col4 = @sy-uname ] AS r INTO TABLE @result.`, ver: Version.v751},
  {abap: `SELECT * FROM ztab1 \\_assoc1[ EXACT ONE TO ONE WHERE col4 = @sy-uname ] AS r INTO TABLE @result.`, ver: Version.v751},
  {abap: `SELECT * FROM ztab1 \\_assoc1( col1 = 'AB', col2 = 3 )[ key1 < 3 ] AS r WHERE col4 = @sy-uname INTO TABLE @result.`, ver: Version.v751},
  {abap: `SELECT * FROM ztab1( col1 = 'AB', col2 = 3 ) \\_assoc1( col1 = 'CD', col2 = 1729 ) AS r WHERE col4 = @sy-uname INTO TABLE @result.`, ver: Version.v751},
  {abap: `SELECT * FROM ztab1( col1 = 'AB', col2 = 3 ) \\_assoc1( col1 = 'CD', col2 = 1728 )[ key1 < 3 ] AS r WHERE col4 = @sy-uname INTO TABLE @result.`, ver: Version.v751},
  {abap: `SELECT * FROM ztab1( col1 = 'AB', col2 = 3 ) \\_assoc1( col1 = 'CD', col2 = 3 )[ key1 < 3 ] \\_assoc2( col1 = @lv_qr, col2 = 2 ) AS r WHERE col4 = @sy-uname INTO TABLE @result.`, ver: Version.v751},
  {abap: `SELECT \\_assoc1-col FROM ztab1 INTO TABLE @r.`, ver: Version.v740sp05},
  {abap: `SELECT t1~\\_assoc1-col FROM ztab1 AS t1 INTO TABLE @r.`, ver: Version.v740sp05},
  {abap: `SELECT \\_assoc1\\_assoc2-col FROM ztab1 INTO TABLE @r.`, ver: Version.v740sp05},
  {abap: `SELECT \\_assoc1-col AS c FROM ztab1 INTO TABLE @r.`, ver: Version.v740sp05},
  {abap: `SELECT \\_assoc1[ key1 < 3 ]-col FROM ztab1 INTO TABLE @r.`, ver: Version.v751},
  {abap: `SELECT \\_assoc1[ WHERE key1 < 3 ]-col FROM ztab1 INTO TABLE @r.`, ver: Version.v751},
  {abap: `SELECT \\_assoc1[ INNER ]-col FROM ztab1 INTO TABLE @r.`, ver: Version.v751},
  {abap: `SELECT \\_assoc1[ LEFT OUTER ]-col FROM ztab1 INTO TABLE @r.`, ver: Version.v751},
  {abap: `SELECT \\_assoc1[ ONE TO ONE ]-col FROM ztab1 INTO TABLE @r.`, ver: Version.v751},
  {abap: `SELECT \\_assoc1[ MANY TO ONE ]-col FROM ztab1 INTO TABLE @r.`, ver: Version.v751},
  {abap: `SELECT \\_assoc1[ INNER WHERE key1 < 3 ]-col FROM ztab1 INTO TABLE @r.`, ver: Version.v751},
  {abap: `SELECT \\_assoc1[ LEFT OUTER WHERE key1 < 3 ]-col FROM ztab1 INTO TABLE @r.`, ver: Version.v751},
  {abap: `SELECT \\_assoc1[ ONE TO ONE WHERE key1 < 3 ]-col FROM ztab1 INTO TABLE @r.`, ver: Version.v751},
  {abap: `SELECT \\_assoc1( col1 = 'AB' )[ key1 < 3 ]-col FROM ztab1 INTO TABLE @r.`, ver: Version.v751},
  {abap: `SELECT t1~\\_assoc1\\_assoc2-col FROM ztab1 AS t1 INTO TABLE @r.`, ver: Version.v740sp05},
  {abap: `SELECT /foo/t1~\\_assoc-col FROM /foo/ztab AS /foo/t1 INTO TABLE @r.`, ver: Version.v740sp05},
  {abap: `SELECT /foo/t1~\\_assoc[ key1 < 3 ]-col FROM /foo/ztab AS /foo/t1 INTO TABLE @r.`, ver: Version.v751},
  {abap: `SELECT t1~key1 AS k1 FROM ztab1 AS t1 WHERE t1~col4 = @sy-uname AND key1 = ( SELECT key1 FROM ztab1 AS t2 WHERE t1~\\_assoc1-key1 = t2~key1 ) INTO TABLE @lt_result.`, ver: Version.v750},
  {abap: `SELECT count(*) AS cnt FROM ztab1 AS t1 WHERE key1 < 8877 GROUP BY t1~\\_assoc1-key1 HAVING count(*) > 0 INTO TABLE @DATA(lt_r).`, ver: Version.v740sp05},
  {abap: `SELECT gla, \\_skat-txt50, indi FROM /foo/bar WHERE indi = @abap_false AND \\_skat-spras = @sy-langu ORDER BY gla ASCENDING INTO TABLE @lt.`, ver: Version.v740sp05},
  {abap: `SELECT FROM zcds FIELDS col1, \\_Text[ ONE TO ONE WHERE Language = @sy-langu ]-LanguageName ORDER BY col1 INTO TABLE @DATA(languages).`, ver: Version.v751},
  {abap: `SELECT FROM /foo/bar FIELDS (mv_sql_select) WHERE uuid = @mv__uuid AND \\_foo\\_bar-top IN @mt_top GROUP BY (mv_sql_group) INTO CORRESPONDING FIELDS OF TABLE @mt_result.`, ver: Version.v750},
], "SELECT association path expressions", Statements.Select);

statementVersionFail([
  {abap: `SELECT * FROM ztab1 \\_assoc1 ( col1 = 'AB' ) AS r WHERE col4 = @sy-uname INTO TABLE @result.`, ver: Version.v751},
  {abap: `SELECT * FROM ztab1\\_assoc1 ( col1 = 'AB' ) AS r WHERE col4 = @sy-uname INTO TABLE @result.`, ver: Version.v751},
  {abap: `SELECT * FROM ztab1( col1 = 'AB' ) \\_assoc1 ( col2 = @lv ) AS r WHERE col4 = @sy-uname INTO TABLE @result.`, ver: Version.v751},
  {abap: `SELECT * FROM ztab1 \\_assoc1 [ col4 = @sy-uname ] AS r WHERE col4 = @sy-uname INTO TABLE @result.`, ver: Version.v751},
  {abap: `SELECT * FROM ztab1\\_assoc1 [ col4 = @sy-uname ] AS r WHERE col4 = @sy-uname INTO TABLE @result.`, ver: Version.v751},
  {abap: `SELECT * FROM ztab1 \\_assoc1( col1 = 'AB' ) [ col4 = @sy-uname ] AS r INTO TABLE @result.`, ver: Version.v751},
  {abap: `SELECT t1~key1 FROM ztab1 AS t1 WHERE t1~ \\_assoc1-key1 = 5 INTO TABLE @r.`, ver: Version.v740sp05},
  {abap: `SELECT count(*) AS cnt FROM ztab1 AS t1 WHERE x = 1 GROUP BY t1~ \\_assoc1-key1 INTO TABLE @DATA(lt_r).`, ver: Version.v740sp05},
  {abap: `SELECT \\_assoc1 [ key1 < 3 ]-col FROM ztab1 INTO TABLE @r.`, ver: Version.v751},
], "SELECT association path invalid spacing");

statementVersionOk([
  {abap: "SELECT * FROM @lt_fields AS fields INTO TABLE @DATA(result).", ver: Version.OpenABAP},
], "SELECT FROM internal table", Statements.Select);

const windowVersions = [
  {abap: `SELECT company, category, item, price, row_number( ) over( ) AS rn FROM @ztable AS t ORDER BY rn INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT company, category, item, price, rank( ) over( order by price descending ) AS rnk FROM @ztable AS t ORDER BY rnk, company, category, item INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT company, category, item, price, dense_rank( ) over( order by price descending ) AS dr FROM @ztable AS t ORDER BY dr, company, category, item INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, field2, field3, field4, row_number( ) over( order by field1, field2, field3 ) AS rn FROM @ztable AS t ORDER BY field3, field2, field1 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, field2, field3, field4, row_number( ) over( partition by field1 order by field4, field3 ) AS rn FROM @ztable AS t ORDER BY field3, field2, field1 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, field2, field3, field4, row_number( ) over( partition by field2, field1 order by field4, field3 ) AS rn FROM @ztable AS t ORDER BY field3, field2, field1 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, field2, field3, field4, rank( ) over( partition by field1 order by field4 descending ) AS rnk FROM @ztable AS t ORDER BY field1, field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, field2, field3, field4, rank( ) over( partition by field2, field1 order by field4 descending ) AS rnk FROM @ztable AS t ORDER BY field1, field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, field2, field3, field4, dense_rank( ) over( partition by field2, field1 order by field4 descending ) AS dr FROM @ztable AS t ORDER BY field1, field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, field2, field3, field4, count(*) over( ) AS cnt FROM @ztable AS t ORDER BY field1, field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, field2, field3, field4, count(*) over( partition by field1 ) AS cnt FROM @ztable AS t ORDER BY field1, field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, field2, field3, field4, count(*) over( partition by field1, field2 ) AS cnt FROM @ztable AS t ORDER BY field1, field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, field2, field3, field4, count(*) over( partition by field1, field2 order by field4 ) AS cnt FROM @ztable AS t ORDER BY field1, field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, field2, field3, field4, sum( field4 ) over( ) AS s FROM @ztable AS t ORDER BY field1, field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, field2, field3, field4, sum( field4 ) over( partition by field1, field2 ) AS s FROM @ztable AS t ORDER BY field1, field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, field2, field3, field4, sum( field4 ) over( partition by field1, field2 order by field4 ) AS s FROM @ztable AS t ORDER BY field1, field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, field2, field3, field4, min( field4 ) over( ) AS m FROM @ztable AS t ORDER BY field1, field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, field2, field3, field4, min( field4 ) over( partition by field1, field2 ) AS m FROM @ztable AS t ORDER BY field1, field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, field2, field3, field4, min( field4 ) over( partition by field1, field2 order by field3 ) AS m FROM @ztable AS t ORDER BY field1, field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, field2, field3, field4, max( field4 ) over( ) AS m FROM @ztable AS t ORDER BY field1, field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, field2, field3, field4, max( field4 ) over( partition by field1, field2 ) AS m FROM @ztable AS t ORDER BY field1, field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, field2, field3, field4, max( field4 ) over( partition by field1, field2 order by field3 ) AS m FROM @ztable AS t ORDER BY field1, field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT AVG( field1 AS DEC( 15, 2 ) ) AS a FROM ztable INTO @DATA(result).`, ver: Version.v751},
  {abap: `SELECT AVG( field1 AS CURR( 15, 2 ) ) AS a FROM ztable INTO @DATA(result).`, ver: Version.v751},
  {abap: `SELECT AVG( field1 AS QUAN( 15, 2 ) ) AS a FROM ztable INTO @DATA(result).`, ver: Version.v751},
  {abap: `SELECT AVG( field1 AS D16N ) AS a FROM ztable INTO @DATA(result).`, ver: Version.v751},
  {abap: `SELECT AVG( field1 AS D34N ) AS a FROM ztable INTO @DATA(result).`, ver: Version.v751},
  {abap: `SELECT AVG( field1 AS FLTP ) AS a FROM ztable INTO @DATA(result).`, ver: Version.v751},
  {abap: `SELECT AVG( DISTINCT field1 AS DEC( 10, 3 ) ) AS a FROM ztable INTO @DATA(result).`, ver: Version.v751},
  {abap: `SELECT field1, field2, field3, field4, avg( field4 as dec( 31, 2 ) ) over( ) AS a FROM @ztable AS t ORDER BY field1, field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, field2, field3, field4, avg( field4 as dec( 31, 2 ) ) over( partition by field1, field2 ) AS a FROM @ztable AS t ORDER BY field1, field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, field2, field3, field4, avg( field4 as dec( 31, 2 ) ) over( partition by field1, field2 order by field3 ) AS a FROM @ztable AS t ORDER BY field1, field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, avg( field4 as curr( 15, 2 ) ) over( ) AS a FROM @ztable AS t ORDER BY field1 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, avg( field4 as quan( 15, 2 ) ) over( ) AS a FROM @ztable AS t ORDER BY field1 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, avg( field4 as d16n ) over( ) AS a FROM @ztable AS t ORDER BY field1 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, avg( field4 as d34n ) over( ) AS a FROM @ztable AS t ORDER BY field1 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, avg( field4 as fltp ) over( ) AS a FROM @ztable AS t ORDER BY field1 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, field2, field3, field4, case when avg( field4 ) over( ) > @lv_val then 1 else 0 end AS flag FROM @ztable AS t ORDER BY field1, field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, field2, field3, field4, count( field4 ) over( ) AS cnt FROM @ztable AS t ORDER BY field1, field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, field2, field3, field4, count( field4 ) over( partition by field1 ) AS cnt FROM @ztable AS t ORDER BY field1, field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, field2, field3, field4, count( field4 ) over( partition by field1, field2 ) AS cnt FROM @ztable AS t ORDER BY field1, field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, field2, sum( field4 ) AS s1, sum( sum( field4 ) ) over( partition by field1 ) AS s2 FROM @ztable AS t GROUP BY field1, field2 ORDER BY field1, field2 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT field1, field2, division( sum( field4 ), sum( sum( field4 ) ) over( partition by field1 ), 2 ) AS d FROM @ztable AS t GROUP BY field1, field2 ORDER BY field1, field2 INTO TABLE @DATA(result).`, ver: Version.v757},
];

statementVersionOk(windowVersions, "SELECT", Statements.Select);

const frameVersions = [
  {abap: `SELECT FROM ztable FIELDS sum( field1 ) over( partition by field2 order by field3 rows between unbounded preceding and unbounded following ) WHERE field4 = @lv_val ORDER BY field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT FROM ztable FIELDS sum( field1 ) over( partition by field2 order by field3 rows between unbounded preceding and 2 following ) WHERE field4 = @lv_val ORDER BY field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT FROM ztable FIELDS sum( field1 ) over( partition by field2 order by field3 rows between unbounded preceding and 1 following ) WHERE field4 = @lv_val ORDER BY field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT FROM ztable FIELDS sum( field1 ) over( partition by field2 order by field3 rows between unbounded preceding and 0 following ) WHERE field4 = @lv_val ORDER BY field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT FROM ztable FIELDS sum( field1 ) over( partition by field2 order by field3 rows between unbounded preceding and current row ) WHERE field4 = @lv_val ORDER BY field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT FROM ztable FIELDS coalesce( sum( field1 ) over( partition by field2 order by field3 rows between 1 following and 2 following ), 1728 ) WHERE field4 = @lv_val ORDER BY field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT FROM ztable FIELDS coalesce( sum( field1 ) over( partition by field2 order by field3 rows between 1 preceding and 2 following ), 1728 ) WHERE field4 = @lv_val ORDER BY field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT FROM ztable FIELDS coalesce( sum( field1 ) over( partition by field2 order by field3 rows between 2 preceding and 1 preceding ), 1728 ) WHERE field4 = @lv_val ORDER BY field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT FROM ztable FIELDS coalesce( sum( field1 ) over( partition by field2 order by field3 rows between 2 preceding and unbounded following ), 1728 ) WHERE field4 = @lv_val ORDER BY field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT FROM ztable FIELDS coalesce( sum( field1 ) over( partition by field2 order by field3 rows between current row and unbounded following ), 1728 ) WHERE field4 = @lv_val ORDER BY field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT FROM ztable FIELDS coalesce( sum( field1 ) over( partition by field2 order by field3 rows between 1 following and unbounded following ), 1728 ) WHERE field4 = @lv_val ORDER BY field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT FROM ztable FIELDS coalesce( avg( field1 as dec( 16, 2 ) ) over( partition by field2 order by field3 rows between 1 following and unbounded following ), 1728 ) WHERE field4 = @lv_val ORDER BY field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
  {abap: `SELECT FROM ztable FIELDS coalesce( avg( field1 as d34n ) over( partition by field2 order by field3 rows between 1 following and unbounded following ), 1728 ) WHERE field4 = @lv_val ORDER BY field2, field3 INTO TABLE @DATA(result).`, ver: Version.v757},
];

statementVersionOk(frameVersions, "SELECT", Statements.Select);

const aggArgExprVersions = [
  {abap: `SELECT SINGLE SUM( field1 + field2 ) FROM ztable INTO @DATA(result).`, ver: Version.v740sp08},
  {abap: `SELECT SINGLE SUM( field1 - field2 ) FROM ztable INTO @DATA(result).`, ver: Version.v740sp08},
  {abap: `SELECT SINGLE SUM( field1 * field2 ) FROM ztable INTO @DATA(result).`, ver: Version.v740sp08},
  {abap: `SELECT SINGLE MIN( field1 + 1 ) FROM ztable INTO @DATA(result).`, ver: Version.v740sp08},
  {abap: `SELECT SINGLE MAX( field1 + field2 ) FROM ztable INTO @DATA(result).`, ver: Version.v740sp08},
  {abap: `SELECT SINGLE AVG( field1 + field2 ) FROM ztable INTO @DATA(result).`, ver: Version.v740sp08},
  {abap: `SELECT SINGLE COUNT( DISTINCT field1 + field2 ) FROM ztable INTO @DATA(result).`, ver: Version.v740sp08},
  {abap: `SELECT SINGLE SUM( field1 + @lv_offset ) FROM ztable INTO @DATA(result).`, ver: Version.v740sp08},
  {abap: `SELECT SINGLE SUM( CASE WHEN field1 > 0 THEN field1 ELSE 0 END ) FROM ztable INTO @DATA(result).`, ver: Version.v740sp08},
  {abap: `SELECT SINGLE SUM( CASE WHEN field1 > 0 THEN field1 ELSE - field1 END ) FROM ztable INTO @DATA(result).`, ver: Version.v740sp08},
  {abap: `SELECT - col AS neg , col FROM ztab INTO TABLE @DATA(lt_r).`, ver: Version.v740sp05},
];

statementVersionOk(aggArgExprVersions, "SELECT", Statements.Select);

const aggInArithVersions = [
  {abap: `SELECT SINGLE 1 + SUM( field1 ) FROM ztable INTO @DATA(result).`, ver: Version.v754},
  {abap: `SELECT SINGLE SUM( field1 ) + SUM( field2 ) FROM ztable INTO @DATA(result).`, ver: Version.v754},
  {abap: `SELECT SINGLE SUM( field1 ) * 2 FROM ztable INTO @DATA(result).`, ver: Version.v754},
  {abap: `SELECT SINGLE CASE WHEN field1 > 0 THEN SUM( field1 ) ELSE 0 END FROM ztable INTO @DATA(result).`, ver: Version.v754},
];

statementVersionOk(aggInArithVersions, "SELECT", Statements.Select);

const versionsFail = [
  {abap: `SELECT * INTO TABLE lt_but000
  FROM but000
  WHERE  but000~partner IN ( '1000' , '2000' , '3000' ).`, ver: Version.v702},
  // order by not possible for SELECT SINGLE
  {abap: `SELECT SINGLE *
  FROM vbak
  INTO @DATA(ls_vbak)
  ORDER BY vbeln.`, ver: Version.v750},
  // missing comma,
  {abap: `SELECT foo bar, moo
  FROM ztab INTO TABLE @DATA(tab)
  ORDER BY PRIMARY KEY.`, ver: Version.v750},
  {abap: `SELECT ( arbgb, text ) AS bar FROM t100 INTO TABLE @DATA(sdf).`, ver: Version.v750},
  {abap: `SELECT ( arbgb AS bar ) FROM t100 INTO TABLE @DATA(sdf).`, ver: Version.v750},
  {abap: `SELECT SINGLE SUM( field1 + field2 ) FROM ztable INTO @DATA(result).`, ver: Version.v740sp05},
  {abap: `SELECT SINGLE 1 + SUM( field1 ) FROM ztable INTO @DATA(result).`, ver: Version.v740sp08},
  {abap: "SELECT SUM( (l_field) ) INTO l_value FROM (l_table).", ver: Version.v702},
];

statementVersionFail(versionsFail, "SELECT");

// https://github.com/abaplint/abaplint/issues/3999
const subqueryInVersions = [
  {abap: `SELECT foo FROM bar INTO TABLE table WHERE foo IN ( SELECT foo FROM bar ).`, ver: Version.v702},
  {abap: `SELECT foo FROM bar INTO TABLE table WHERE foo NOT IN ( SELECT foo FROM bar WHERE foo = lv_val ).`, ver: Version.v702},
];

statementVersionOk(subqueryInVersions, "SELECT subquery in IN clause", Statements.Select);

const subqueryExistsVersions = [
  {abap: `SELECT foo FROM bar INTO TABLE lt WHERE EXISTS ( SELECT * FROM baz WHERE baz~foo = bar~foo ).`, ver: Version.v702},
  {abap: `SELECT AVG( b~kbetr ) AS kbetr FROM a670 AS a JOIN konp AS b ON a~knumh EQ b~knumh INTO @lv_kbetr WHERE a~kunnr IN ( SELECT kunnr FROM zrlx_c_can_rlx JOIN zrlx_c_can_pdv ON zrlx_c_can_rlx~canale_anag = zrlx_c_can_pdv~canale_anag JOIN t001w ON zrlx_c_can_pdv~pdv = t001w~werks WHERE canale_relex = @<mat_can>-canale_relex ) AND EXISTS ( SELECT 'X' FROM wlk1 WHERE filia = a~kunnr AND artnr = @<mat_can>-matnr ).`, ver: Version.v740sp05},
];

statementVersionOk(subqueryExistsVersions, "SELECT subquery in EXISTS clause", Statements.Select);

const correlatedMaxSubqueryVersions = [
  {abap: `SELECT *
  INTO TABLE lt_result
  FROM zmain_table AS a CLIENT SPECIFIED
  WHERE a~mandt   EQ sy-mandt
    AND a~comp    EQ p_comp
    AND a~plant   IN s_plant
    AND a~vendor  IN s_vendor
    AND a~material IN s_material
    AND a~channel IN s_channel
    AND a~version EQ
    ( SELECT MAX( version ) FROM zmain_table CLIENT SPECIFIED
      WHERE mandt    EQ sy-mandt
        AND comp     EQ p_comp
        AND plant    EQ a~plant
        AND vendor   EQ a~vendor
        AND material EQ a~material
        AND channel  EQ a~channel
        AND version  IN s_version ).`, ver: Version.v740sp08},
];

statementVersionOk(correlatedMaxSubqueryVersions, "SELECT correlated MAX subquery", Statements.Select);

const privilegedVersions = [
  {abap: `SELECT * FROM ztab WITH PRIVILEGED ACCESS INTO TABLE @DATA(lt).`, ver: Version.v752},
  {abap: `SELECT SINGLE * FROM ztab WITH PRIVILEGED ACCESS INTO @DATA(ls).`, ver: Version.v752},
  {abap: `SELECT * FROM ztab INTO TABLE @DATA(lt) PRIVILEGED ACCESS.`, ver: Version.v758},
  {abap: `SELECT SINGLE * FROM ztab INTO @DATA(ls) PRIVILEGED ACCESS.`, ver: Version.v758},
];

statementVersion(privilegedVersions, "SELECT privileged access", Statements.Select);

const privilegedVersionsFail = [
  {abap: `SELECT * FROM ztab WITH PRIVILEGED ACCESS INTO TABLE @DATA(lt).`, ver: Version.v751},
  {abap: `SELECT * FROM ztab INTO TABLE @DATA(lt) PRIVILEGED ACCESS.`, ver: Version.v756},
  {abap: `SELECT * FROM ztab INTO TABLE @DATA(lt) PRIVILEGED ACCESS.`, ver: Version.v757},
];

statementVersionFail(privilegedVersionsFail, "SELECT privileged access");

const optionsVersions = [
  {abap: `SELECT count(*) FROM veri_clnt INTO @DATA(cnt) OPTIONS USING ALL CLIENTS.`, ver: Version.v758},
  {abap: `SELECT count(*) FROM ztab INTO @DATA(wa) OPTIONS USING ALL CLIENTS.`, ver: Version.v758},
  {abap: `SELECT * FROM ztab ORDER BY PRIMARY KEY INTO TABLE @DATA(res) OPTIONS USING ALL CLIENTS.`, ver: Version.v758},
  {abap: `SELECT * FROM ztab ORDER BY PRIMARY KEY INTO TABLE @DATA(res) OPTIONS USING CLIENTS IN @lv_clients.`, ver: Version.v758},
  {abap: `SELECT * FROM ztab ORDER BY PRIMARY KEY INTO TABLE @DATA(res) OPTIONS USING CLIENTS IN t000.`, ver: Version.v758},
  {abap: `SELECT * FROM ztab ORDER BY PRIMARY KEY INTO TABLE @DATA(res) OPTIONS USING CLIENT '000'.`, ver: Version.v758},
  {abap: `SELECT * FROM ztab ORDER BY PRIMARY KEY INTO TABLE @DATA(res) OPTIONS PRIVILEGED ACCESS.`, ver: Version.v758},
  {abap: `SELECT * FROM ztab ORDER BY PRIMARY KEY INTO TABLE @DATA(res) OPTIONS BYPASSING BUFFER.`, ver: Version.v758},
  {abap: `SELECT * FROM ztab INTO TABLE @DATA(res) OPTIONS CONNECTION foo.`, ver: Version.v758},
  {abap: `SELECT * FROM ztab INTO TABLE @DATA(res) OPTIONS USING ALL CLIENTS PRIVILEGED ACCESS.`, ver: Version.v758},
  {abap: `SELECT * FROM ztab INTO TABLE @DATA(res) OPTIONS USING ALL CLIENTS BYPASSING BUFFER.`, ver: Version.v758},
  {abap: `SELECT * FROM ztab INTO TABLE @DATA(res) OPTIONS USING ALL CLIENTS CONNECTION foo.`, ver: Version.v758},
  {abap: `SELECT * FROM ztab INTO TABLE @DATA(res) OPTIONS USING ALL CLIENTS PRIVILEGED ACCESS BYPASSING BUFFER.`, ver: Version.v758},
  {abap: `SELECT * FROM ztab INTO TABLE @DATA(res) OPTIONS USING ALL CLIENTS PRIVILEGED ACCESS CONNECTION foo.`, ver: Version.v758},
  {abap: `SELECT * FROM ztab INTO TABLE @DATA(res) OPTIONS USING ALL CLIENTS BYPASSING BUFFER CONNECTION foo.`, ver: Version.v758},
  {abap: `SELECT * FROM ztab INTO TABLE @DATA(res) OPTIONS USING ALL CLIENTS PRIVILEGED ACCESS BYPASSING BUFFER CONNECTION foo.`, ver: Version.v758},
  {abap: `SELECT * FROM ztab INTO TABLE @DATA(res) OPTIONS PRIVILEGED ACCESS BYPASSING BUFFER.`, ver: Version.v758},
  {abap: `SELECT * FROM ztab INTO TABLE @DATA(res) OPTIONS PRIVILEGED ACCESS CONNECTION foo.`, ver: Version.v758},
  {abap: `SELECT * FROM ztab INTO TABLE @DATA(res) OPTIONS BYPASSING BUFFER CONNECTION foo.`, ver: Version.v758},
  {abap: `SELECT * FROM ztab INTO TABLE @DATA(res) OPTIONS PRIVILEGED ACCESS BYPASSING BUFFER CONNECTION foo.`, ver: Version.v758},
];

statementVersion(optionsVersions, "SELECT OPTIONS clause", Statements.Select);

const optionsVersionsFail = [
  {abap: `SELECT count(*) FROM ztab INTO @DATA(wa) OPTIONS USING ALL CLIENTS.`, ver: Version.v757},
];

statementVersionFail(optionsVersionsFail, "SELECT OPTIONS clause");

const intersectExceptVersions = [
  {abap: `SELECT zcol FROM ztab1 INTERSECT SELECT zcol FROM ztab2 INTO TABLE @DATA(res).`, ver: Version.v756},
  {abap: `SELECT zcol FROM ztab1 INTERSECT DISTINCT SELECT zcol FROM ztab2 INTO TABLE @DATA(res).`, ver: Version.v756},
  {abap: `SELECT zcol FROM ztab1 EXCEPT SELECT zcol FROM ztab2 INTO TABLE @DATA(res).`, ver: Version.v756},
  {abap: `SELECT zcol FROM ztab1 EXCEPT DISTINCT SELECT zcol FROM ztab2 INTO TABLE @DATA(res).`, ver: Version.v756},
];

statementVersion(intersectExceptVersions, "SELECT INTERSECT/EXCEPT", Statements.Select);

const intersectExceptVersionsFail = [
  {abap: `SELECT zcol FROM ztab1 INTERSECT SELECT zcol FROM ztab2 INTO TABLE @DATA(res).`, ver: Version.v755},
  {abap: `SELECT zcol FROM ztab1 EXCEPT SELECT zcol FROM ztab2 INTO TABLE @DATA(res).`, ver: Version.v755},
];

statementVersionFail(intersectExceptVersionsFail, "SELECT INTERSECT/EXCEPT");

const unionChainVersions = [
  {abap: `SELECT zcol FROM ztab UNION ALL SELECT zcol FROM ztab UNION SELECT zcol FROM ztab INTO TABLE @DATA(res).`, ver: Version.v750},
];

statementVersion(unionChainVersions, "SELECT UNION chains and parentheses", Statements.Select);

const unionChainVersionsFail = [
  {abap: `SELECT zcol FROM ztab UNION ALL SELECT zcol FROM ztab INTO TABLE @DATA(res).`, ver: Version.v740sp08},
];

statementVersionFail(unionChainVersionsFail, "SELECT UNION chains and parentheses");

const subselectSetOpLoopVersions = [
  {abap: `SELECT zcol FROM ztab WHERE EXISTS ( SELECT zcol FROM ztab UNION ( SELECT zcol FROM ztab UNION SELECT zcol FROM ztab GROUP BY zcol ) ) GROUP BY zcol INTO @wa.`, ver: Version.v750},
];

statementVersion(subselectSetOpLoopVersions, "SELECT subselect with UNION/parens (loop)", Statements.SelectLoop);

const subselectSetOpVersions = [
  {abap: `SELECT * FROM ztab WHERE zcol = ( ( SELECT zcol FROM ztab2 ) ) INTO TABLE @itab.`, ver: Version.v750},
  {abap: `SELECT * FROM ztab WHERE zcol = ( ( SELECT zcol FROM ztab2 ) UNION SELECT zcol FROM ztab2 ) INTO TABLE @itab.`, ver: Version.v750},
];

statementVersion(subselectSetOpVersions, "SELECT subselect with UNION/parens", Statements.Select);

const unionClientVersions = [
  `SELECT f1 FROM ztab UNION ALL SELECT f1 FROM ztab USING CLIENT @mandt INTO TABLE @DATA(res).`,
  `SELECT f1 FROM ztab USING CLIENT @mandt UNION ALL SELECT f1 FROM ztab INTO TABLE @DATA(res).`,
  `SELECT f1 FROM ('ztab') UNION ALL SELECT f1 FROM ztab INTO TABLE @DATA(res).`,
  `SELECT f1 FROM ztab UNION ALL SELECT f1 FROM ('ztab') INTO TABLE @DATA(res).`,
  `SELECT f1 FROM ('ztab') UNION ALL SELECT f1 FROM ('ztab') USING CLIENT @mandt INTO TABLE @DATA(res).`,
  `SELECT f1 FROM ('ztab') USING CLIENT @mandt UNION ALL SELECT f1 FROM ('ztab') INTO TABLE @DATA(res).`,
  `SELECT f1 FROM ztab CLIENT SPECIFIED WHERE k = @sy-mandt UNION ALL SELECT f1 FROM ztab USING CLIENT @mandt INTO TABLE @DATA(res).`,
  `SELECT f1 FROM ztab USING CLIENT @mandt UNION ALL SELECT f1 FROM ztab CLIENT SPECIFIED WHERE k = @sy-mandt INTO TABLE @DATA(res).`,
  `SELECT f1 FROM ('ztab') CLIENT SPECIFIED WHERE k = @sy-mandt UNION ALL SELECT f1 FROM ztab INTO TABLE @DATA(res).`,
  `SELECT f1 FROM ('ztab') CLIENT SPECIFIED WHERE k = @sy-mandt UNION ALL SELECT f1 FROM ztab USING CLIENT @mandt INTO TABLE @DATA(res).`,
  `SELECT f1 FROM ('ztab') CLIENT SPECIFIED WHERE k = @sy-mandt UNION ALL SELECT f1 FROM ('ztab') USING CLIENT @mandt INTO TABLE @DATA(res).`,
  `SELECT f1 FROM ztab CLIENT SPECIFIED WHERE k = @sy-mandt UNION ALL SELECT f1 FROM ('ztab') USING CLIENT @mandt INTO TABLE @DATA(res).`,
  `SELECT f1 FROM ('ztab') USING CLIENT @mandt UNION ALL SELECT f1 FROM ('ztab') CLIENT SPECIFIED WHERE k = @curr INTO TABLE @DATA(res).`,
  `SELECT f1 FROM ztab UNION ALL SELECT f1 FROM ztab UNION SELECT f1 FROM ztab INTO TABLE @DATA(res).`,
  `SELECT f1 AS int FROM ztab UNION SELECT f2 AS int FROM ztab ORDER BY int DESCENDING INTO TABLE @DATA(res).`,
  `SELECT f1 FROM ztab UNION ( SELECT f1 FROM ztab UNION ALL SELECT f1 FROM ztab ) INTO TABLE @DATA(res).`,
  `SELECT f1 FROM ztab UNION ALL ( SELECT f1 FROM ztab UNION SELECT f1 FROM ztab ) INTO TABLE @DATA(res).`,
  `SELECT f1 FROM ztab UNION ( SELECT f1 FROM ztab ) ORDER BY f1 INTO TABLE @DATA(res).`,
  `SELECT f1 FROM ztab UNION ALL ( SELECT f1 FROM ztab ) ORDER BY f1 DESCENDING INTO TABLE @DATA(res).`,
  `SELECT f1 FROM ztab UNION SELECT f1 FROM ztab2 ORDER BY f1 INTO TABLE @DATA(res).`,
  `SELECT f1 FROM ztab UNION SELECT f2 FROM ztab2 GROUP BY f2 ORDER BY f2 INTO TABLE @DATA(res).`,
  `SELECT f1 , COUNT(*) AS cnt FROM ztab GROUP BY f1 UNION SELECT f1 , COUNT(*) AS cnt FROM ztab2 GROUP BY f1 ORDER BY f1 INTO TABLE @DATA(res).`,
];

statementType(unionClientVersions, "SELECT UNION CLIENT SPECIFIED / USING CLIENT / dynamic", Statements.Select);

statementVersion([
  {abap: `SELECT * FROM ztab CLIENT SPECIFIED t~mandt INTO TABLE @DATA(lt_r).`, ver: Version.v740sp05},
  {abap: `SELECT * FROM ztab CLIENT SPECIFIED t~mandt WHERE col = @lv_v INTO TABLE @DATA(lt_r).`, ver: Version.v740sp05},
  {abap: `SELECT * FROM ztab INNER JOIN ztab2 ON ztab~k = ztab2~k CLIENT SPECIFIED ztab~mandt , ztab2~mandt INTO TABLE @DATA(lt_r).`, ver: Version.v740sp05},
  {abap: `SELECT * FROM ('ztab') CLIENT SPECIFIED (lv_cl) INTO CORRESPONDING FIELDS OF TABLE @lt_r.`, ver: Version.v740sp05},
  {abap: `SELECT * FROM ztab CLIENT SPECIFIED (lv_cl) WHERE col = @lv_v INTO TABLE @DATA(lt_r).`, ver: Version.v740sp05},
], "SELECT CLIENT SPECIFIED with column list or dynamic", Statements.Select);

statementVersionFail([
  {abap: `SELECT * FROM ztab CLIENT SPECIFIED t~mandt INTO TABLE @DATA(lt_r).`, ver: Version.v740sp02},
  {abap: `SELECT * FROM ztab CLIENT SPECIFIED (lv_cl) INTO TABLE @DATA(lt_r).`, ver: Version.v740sp02},
], "SELECT CLIENT SPECIFIED column list requires v740sp05");

const unionCorrespVersions = [
  `SELECT f1 FROM ztab UNION SELECT f1 FROM ztab INTO CORRESPONDING FIELDS OF @wa.`,
  `SELECT f1 FROM ztab UNION SELECT f1 FROM ('ztab') INTO CORRESPONDING FIELDS OF @wa.`,
  `SELECT f1 FROM ztab UNION SELECT f1 FROM ('ztab') CLIENT SPECIFIED WHERE k = @sy-mandt INTO CORRESPONDING FIELDS OF @wa.`,
  `SELECT f1 FROM ztab CLIENT SPECIFIED WHERE k = @sy-mandt UNION SELECT f1 FROM ('ztab') CLIENT SPECIFIED WHERE k = @sy-mandt INTO CORRESPONDING FIELDS OF @wa.`,
];

statementType(unionCorrespVersions, "SELECT UNION into corresponding fields", Statements.SelectLoop);

statementType([
  `SELECT * FROM ztab INTO wa UP TO 5 ROWS FOR ALL ENTRIES IN lt WHERE col = lt-col.`,
  `SELECT * FROM ztab INTO wa UP TO lv_n ROWS FOR ALL ENTRIES IN lt WHERE col = lt-col.`,
  `SELECT * FROM ztab INNER JOIN ztab2 ON ztab~k EQ ztab2~k INTO wa UP TO lv_n ROWS FOR ALL ENTRIES IN lt WHERE ztab~k EQ lt-k.`,
], "SELECT INTO structure UP TO ROWS FOR ALL ENTRIES", Statements.SelectLoop);

statementVersion([
  {abap: `SELECT col FROM ztab ORDER BY col INTO @DATA(lv_r) UP TO 1 ROWS OFFSET 5.`, ver: Version.v751},
  {abap: `SELECT col FROM ztab ORDER BY (lv_dyn) INTO @DATA(lv_r) UP TO 1 ROWS OFFSET 5.`, ver: Version.v751},
  {abap: `SELECT col FROM ztab ORDER BY col INTO TABLE @DATA(lt_r) PACKAGE SIZE 17 UP TO 1 ROWS OFFSET 2.`, ver: Version.v751},
], "SELECT OFFSET after INTO UP TO", Statements.SelectLoop);

statementType([
  `WITH +cte AS ( SELECT col FROM ztab ) SELECT FROM +cte FIELDS col INTO TABLE @DATA(lt_r).`,
], "WITH parses as With not Select", Statements.With);

statementType([
  `WITH +cte AS ( SELECT col FROM ztab ) SELECT FROM +cte FIELDS col INTO @wa.`,
], "WITH parses as WithLoop not Select", Statements.WithLoop);

statementExpectFail([
  `SELECT col FROM ztab INTO @wa PACKAGE SIZE 10.`,
  `SELECT col FROM ztab INTO lv_wa PACKAGE SIZE 10.`,
], "PACKAGE SIZE requires INTO TABLE");

statementExpectFail([
  `SELECT col FROM ztab INTO TABLE @lt INTO @wa.`,
  `SELECT col FROM ztab INTO @wa INTO TABLE @lt.`,
], "SELECT allows only one trailing INTO target");

statementExpectFail([
  `SELECT field FROM table INTO TABLE lt_table WHERE field IN ( SELECT SINGLE FOR UPDATE * FROM ztab WHERE field = lv_field ).`,
], "SELECT SINGLE FOR UPDATE in IN subquery");

// keywords that are valid column names in SELECT <kw> FROM ztab INTO @wa.
statementType([
  `SELECT ABAP FROM ztab INTO @wa.`,
  `SELECT ABBREVIATION FROM ztab INTO @wa.`,
  `SELECT ACCEPTING FROM ztab INTO @wa.`,
  `SELECT ACCESS FROM ztab INTO @wa.`,
  `SELECT ADOPT FROM ztab INTO @wa.`,
  `SELECT AHEAD FROM ztab INTO @wa.`,
  `SELECT ALL FROM ztab INTO @wa.`,
  `SELECT ALLOWED FROM ztab INTO @wa.`,
  `SELECT ALPHANUM FROM ztab INTO @wa.`,
  `SELECT AND FROM ztab INTO @wa.`,
  `SELECT ANY FROM ztab INTO @wa.`,
  `SELECT ANYWHERE FROM ztab INTO @wa.`,
  `SELECT ASCENDING FROM ztab INTO @wa.`,
  `SELECT ASSOCIATION FROM ztab INTO @wa.`,
  `SELECT ASSOCIATIONS FROM ztab INTO @wa.`,
  `SELECT AUTHORITY_CHECK FROM ztab INTO @wa.`,
  `SELECT AVG FROM ztab INTO @wa.`,
  `SELECT BALANCE FROM ztab INTO @wa.`,
  `SELECT BASE FROM ztab INTO @wa.`,
  `SELECT BEGINNING FROM ztab INTO @wa.`,
  `SELECT BETWEEN FROM ztab INTO @wa.`,
  `SELECT BITFIELD FROM ztab INTO @wa.`,
  `SELECT BLOB FROM ztab INTO @wa.`,
  `SELECT BREAKUP FROM ztab INTO @wa.`,
  `SELECT BUFFER FROM ztab INTO @wa.`,
  `SELECT BULK FROM ztab INTO @wa.`,
  `SELECT BY FROM ztab INTO @wa.`,
  `SELECT BYPASSING FROM ztab INTO @wa.`,
  `SELECT CACHE FROM ztab INTO @wa.`,
  `SELECT CALCULATION FROM ztab INTO @wa.`,
  `SELECT CAST FROM ztab INTO @wa.`,
  `SELECT CHAR FROM ztab INTO @wa.`,
  `SELECT CHECK FROM ztab INTO @wa.`,
  `SELECT CHILD FROM ztab INTO @wa.`,
  `SELECT CLIENT FROM ztab INTO @wa.`,
  `SELECT CLIENTS FROM ztab INTO @wa.`,
  `SELECT CLNT FROM ztab INTO @wa.`,
  `SELECT CLOB FROM ztab INTO @wa.`,
  `SELECT CLOSE FROM ztab INTO @wa.`,
  `SELECT COLUMNS FROM ztab INTO @wa.`,
  `SELECT COMPARE FROM ztab INTO @wa.`,
  `SELECT COMPARISON FROM ztab INTO @wa.`,
  `SELECT CONDITION FROM ztab INTO @wa.`,
  `SELECT CONVERT_LEGACY_COLUMNS FROM ztab INTO @wa.`,
  `SELECT CORR FROM ztab INTO @wa.`,
  `SELECT CORRESPONDING FROM ztab INTO @wa.`,
  `SELECT CORR_SPEARMAN FROM ztab INTO @wa.`,
  `SELECT COUNT FROM ztab INTO @wa.`,
  `SELECT CREATE FROM ztab INTO @wa.`,
  `SELECT CREATING FROM ztab INTO @wa.`,
  `SELECT CROSS FROM ztab INTO @wa.`,
  `SELECT CUKY FROM ztab INTO @wa.`,
  `SELECT CURR FROM ztab INTO @wa.`,
  `SELECT CURRENT FROM ztab INTO @wa.`,
  `SELECT CURSOR FROM ztab INTO @wa.`,
  `SELECT CYCLES FROM ztab INTO @wa.`,
  `SELECT D16D FROM ztab INTO @wa.`,
  `SELECT D16N FROM ztab INTO @wa.`,
  `SELECT D16R FROM ztab INTO @wa.`,
  `SELECT D34D FROM ztab INTO @wa.`,
  `SELECT D34N FROM ztab INTO @wa.`,
  `SELECT D34R FROM ztab INTO @wa.`,
  `SELECT DATE FROM ztab INTO @wa.`,
  `SELECT DATN FROM ztab INTO @wa.`,
  `SELECT DATS FROM ztab INTO @wa.`,
  `SELECT DEC FROM ztab INTO @wa.`,
  `SELECT DECAY FROM ztab INTO @wa.`,
  `SELECT DECFLOAT16 FROM ztab INTO @wa.`,
  `SELECT DECFLOAT34 FROM ztab INTO @wa.`,
  `SELECT DECLARE FROM ztab INTO @wa.`,
  `SELECT DEFAULT FROM ztab INTO @wa.`,
  `SELECT DELETE FROM ztab INTO @wa.`,
  `SELECT DENSE_RANK FROM ztab INTO @wa.`,
  `SELECT DEPTH FROM ztab INTO @wa.`,
  `SELECT DESCENDING FROM ztab INTO @wa.`,
  `SELECT DEVALUATE FROM ztab INTO @wa.`,
  `SELECT DF16_DEC FROM ztab INTO @wa.`,
  `SELECT DF16_RAW FROM ztab INTO @wa.`,
  `SELECT DF34_DEC FROM ztab INTO @wa.`,
  `SELECT DF34_RAW FROM ztab INTO @wa.`,
  `SELECT DISTANCE FROM ztab INTO @wa.`,
  `SELECT DUPLICATE FROM ztab INTO @wa.`,
  `SELECT ELSE FROM ztab INTO @wa.`,
  `SELECT END FROM ztab INTO @wa.`,
  `SELECT ENTITY FROM ztab INTO @wa.`,
  `SELECT ENTRIES FROM ztab INTO @wa.`,
  `SELECT EQ FROM ztab INTO @wa.`,
  `SELECT ERROR FROM ztab INTO @wa.`,
  `SELECT ESCAPE FROM ztab INTO @wa.`,
  `SELECT EXACT FROM ztab INTO @wa.`,
  `SELECT EXCESS FROM ztab INTO @wa.`,
  `SELECT EXPOSE FROM ztab INTO @wa.`,
  `SELECT EXPOSING FROM ztab INTO @wa.`,
  `SELECT EXTENDED FROM ztab INTO @wa.`,
  `SELECT FACTOR FROM ztab INTO @wa.`,
  `SELECT FETCH FROM ztab INTO @wa.`,
  `SELECT FIELDS FROM ztab INTO @wa.`,
  `SELECT FIRST FROM ztab INTO @wa.`,
  `SELECT FIRST_VALUE FROM ztab INTO @wa.`,
  `SELECT FLEXIBLE FROM ztab INTO @wa.`,
  `SELECT FLTP FROM ztab INTO @wa.`,
  `SELECT FOLLOWING FROM ztab INTO @wa.`,
  `SELECT FORCE FROM ztab INTO @wa.`,
  `SELECT FUZZY FROM ztab INTO @wa.`,
  `SELECT GAUSSIAN FROM ztab INTO @wa.`,
  `SELECT GE FROM ztab INTO @wa.`,
  `SELECT GENERATE FROM ztab INTO @wa.`,
  `SELECT GROUP FROM ztab INTO @wa.`,
  `SELECT GROUPING FROM ztab INTO @wa.`,
  `SELECT GT FROM ztab INTO @wa.`,
  `SELECT HIERARCHY FROM ztab INTO @wa.`,
  `SELECT HIERARCHY_ANCESTORS FROM ztab INTO @wa.`,
  `SELECT HIERARCHY_ANCESTORS_AGGREGATE FROM ztab INTO @wa.`,
  `SELECT HIERARCHY_DESCENDANTS FROM ztab INTO @wa.`,
  `SELECT HIERARCHY_DESCENDANTS_AGGREGATE FROM ztab INTO @wa.`,
  `SELECT HIERARCHY_SIBLINGS FROM ztab INTO @wa.`,
  `SELECT HOLD FROM ztab INTO @wa.`,
  `SELECT HOUSE FROM ztab INTO @wa.`,
  `SELECT IDENTIFIER FROM ztab INTO @wa.`,
  `SELECT IGNORE FROM ztab INTO @wa.`,
  `SELECT IN FROM ztab INTO @wa.`,
  `SELECT INCLUDING FROM ztab INTO @wa.`,
  `SELECT INCREMENTAL FROM ztab INTO @wa.`,
  `SELECT INDICATORS FROM ztab INTO @wa.`,
  `SELECT INITIAL FROM ztab INTO @wa.`,
  `SELECT INNER FROM ztab INTO @wa.`,
  `SELECT INPUT FROM ztab INTO @wa.`,
  `SELECT INT1 FROM ztab INTO @wa.`,
  `SELECT INT2 FROM ztab INTO @wa.`,
  `SELECT INT4 FROM ztab INTO @wa.`,
  `SELECT INT8 FROM ztab INTO @wa.`,
  `SELECT IS FROM ztab INTO @wa.`,
  `SELECT IS_MASKED FROM ztab INTO @wa.`,
  `SELECT JOIN FROM ztab INTO @wa.`,
  `SELECT KEY FROM ztab INTO @wa.`,
  `SELECT KEYS FROM ztab INTO @wa.`,
  `SELECT LAG FROM ztab INTO @wa.`,
  `SELECT LANG FROM ztab INTO @wa.`,
  `SELECT LANGUAGE FROM ztab INTO @wa.`,
  `SELECT LAST FROM ztab INTO @wa.`,
  `SELECT LAST_VALUE FROM ztab INTO @wa.`,
  `SELECT LE FROM ztab INTO @wa.`,
  `SELECT LEAD FROM ztab INTO @wa.`,
  `SELECT LEAVES FROM ztab INTO @wa.`,
  `SELECT LEFT FROM ztab INTO @wa.`,
  `SELECT LENGTH FROM ztab INTO @wa.`,
  `SELECT LEVEL FROM ztab INTO @wa.`,
  `SELECT LEVELED FROM ztab INTO @wa.`,
  `SELECT LEVELS FROM ztab INTO @wa.`,
  `SELECT LIKE FROM ztab INTO @wa.`,
  `SELECT LINEAR FROM ztab INTO @wa.`,
  `SELECT LOAD FROM ztab INTO @wa.`,
  `SELECT LOCATOR FROM ztab INTO @wa.`,
  `SELECT LOGARITHMIC FROM ztab INTO @wa.`,
  `SELECT LT FROM ztab INTO @wa.`,
  `SELECT MANY FROM ztab INTO @wa.`,
  `SELECT MAPPING FROM ztab INTO @wa.`,
  `SELECT MATCH FROM ztab INTO @wa.`,
  `SELECT MATCHED FROM ztab INTO @wa.`,
  `SELECT MATCHING FROM ztab INTO @wa.`,
  `SELECT MAX FROM ztab INTO @wa.`,
  `SELECT MEASURES FROM ztab INTO @wa.`,
  `SELECT MEDIAN FROM ztab INTO @wa.`,
  `SELECT MERGE FROM ztab INTO @wa.`,
  `SELECT MIN FROM ztab INTO @wa.`,
  `SELECT MINIMAL FROM ztab INTO @wa.`,
  `SELECT MODE FROM ztab INTO @wa.`,
  `SELECT MULTIPLE FROM ztab INTO @wa.`,
  `SELECT NE FROM ztab INTO @wa.`,
  `SELECT NEW FROM ztab INTO @wa.`,
  `SELECT NEXT FROM ztab INTO @wa.`,
  `SELECT NON FROM ztab INTO @wa.`,
  `SELECT NOWAIT FROM ztab INTO @wa.`,
  `SELECT NTILE FROM ztab INTO @wa.`,
  `SELECT NULL FROM ztab INTO @wa.`,
  `SELECT NULLS FROM ztab INTO @wa.`,
  `SELECT NUMBER FROM ztab INTO @wa.`,
  `SELECT NUMC FROM ztab INTO @wa.`,
  `SELECT OF FROM ztab INTO @wa.`,
  `SELECT OFF FROM ztab INTO @wa.`,
  `SELECT OFFSET FROM ztab INTO @wa.`,
  `SELECT ON FROM ztab INTO @wa.`,
  `SELECT ONE FROM ztab INTO @wa.`,
  `SELECT ONLY FROM ztab INTO @wa.`,
  `SELECT OPEN FROM ztab INTO @wa.`,
  `SELECT OPTIONS FROM ztab INTO @wa.`,
  `SELECT OR FROM ztab INTO @wa.`,
  `SELECT ORDER FROM ztab INTO @wa.`,
  `SELECT ORPHANS FROM ztab INTO @wa.`,
  `SELECT OTHER FROM ztab INTO @wa.`,
  `SELECT OUTER FROM ztab INTO @wa.`,
  `SELECT OVER FROM ztab INTO @wa.`,
  `SELECT PACKAGE FROM ztab INTO @wa.`,
  `SELECT PARENT FROM ztab INTO @wa.`,
  `SELECT PARENTS FROM ztab INTO @wa.`,
  `SELECT PARTITION FROM ztab INTO @wa.`,
  `SELECT PERIOD FROM ztab INTO @wa.`,
  `SELECT POSTCODE FROM ztab INTO @wa.`,
  `SELECT PRECEDING FROM ztab INTO @wa.`,
  `SELECT PRIMARY FROM ztab INTO @wa.`,
  `SELECT PRIVILEGED FROM ztab INTO @wa.`,
  `SELECT PRODUCT FROM ztab INTO @wa.`,
  `SELECT PROVIDED FROM ztab INTO @wa.`,
  `SELECT QUAN FROM ztab INTO @wa.`,
  `SELECT RANK FROM ztab INTO @wa.`,
  `SELECT RAW FROM ztab INTO @wa.`,
  `SELECT RAWSTRING FROM ztab INTO @wa.`,
  `SELECT READER FROM ztab INTO @wa.`,
  `SELECT RECURSE FROM ztab INTO @wa.`,
  `SELECT REDIRECTED FROM ztab INTO @wa.`,
  `SELECT RESULT FROM ztab INTO @wa.`,
  `SELECT RETAIN FROM ztab INTO @wa.`,
  `SELECT RIGHT FROM ztab INTO @wa.`,
  `SELECT ROOT FROM ztab INTO @wa.`,
  `SELECT ROW FROM ztab INTO @wa.`,
  `SELECT ROW_NUMBER FROM ztab INTO @wa.`,
  `SELECT ROWS FROM ztab INTO @wa.`,
  `SELECT SCALE FROM ztab INTO @wa.`,
  `SELECT SCORE FROM ztab INTO @wa.`,
  `SELECT SEARCH FROM ztab INTO @wa.`,
  `SELECT SELECT FROM ztab INTO @wa.`,
  `SELECT SET FROM ztab INTO @wa.`,
  `SELECT SETS FROM ztab INTO @wa.`,
  `SELECT SIBLINGS FROM ztab INTO @wa.`,
  `SELECT SIMILARITY FROM ztab INTO @wa.`,
  `SELECT SIZE FROM ztab INTO @wa.`,
  `SELECT SOME FROM ztab INTO @wa.`,
  `SELECT SOURCE FROM ztab INTO @wa.`,
  `SELECT SPANTREE FROM ztab INTO @wa.`,
  `SELECT SPECIFIED FROM ztab INTO @wa.`,
  `SELECT SPELL FROM ztab INTO @wa.`,
  `SELECT SSTRING FROM ztab INTO @wa.`,
  `SELECT START FROM ztab INTO @wa.`,
  `SELECT STDDEV FROM ztab INTO @wa.`,
  `SELECT STRING FROM ztab INTO @wa.`,
  `SELECT STRING_AGG FROM ztab INTO @wa.`,
  `SELECT STRUCTURE FROM ztab INTO @wa.`,
  `SELECT SUBSTRING FROM ztab INTO @wa.`,
  `SELECT SUBTOTAL FROM ztab INTO @wa.`,
  `SELECT SUM FROM ztab INTO @wa.`,
  `SELECT SYMMETRIC FROM ztab INTO @wa.`,
  `SELECT TABLE FROM ztab INTO @wa.`,
  `SELECT TEMPORAL FROM ztab INTO @wa.`,
  `SELECT TEXT FROM ztab INTO @wa.`,
  `SELECT THEN FROM ztab INTO @wa.`,
  `SELECT THRESHOLD FROM ztab INTO @wa.`,
  `SELECT TIMN FROM ztab INTO @wa.`,
  `SELECT TIMS FROM ztab INTO @wa.`,
  `SELECT TO FROM ztab INTO @wa.`,
  `SELECT TOKEN FROM ztab INTO @wa.`,
  `SELECT TOLERANCE FROM ztab INTO @wa.`,
  `SELECT TOTAL FROM ztab INTO @wa.`,
  `SELECT TRANSLATION FROM ztab INTO @wa.`,
  `SELECT TYPE FROM ztab INTO @wa.`,
  `SELECT UNBOUNDED FROM ztab INTO @wa.`,
  `SELECT UNIT FROM ztab INTO @wa.`,
  `SELECT UNTIL FROM ztab INTO @wa.`,
  `SELECT UP FROM ztab INTO @wa.`,
  `SELECT UPDATE FROM ztab INTO @wa.`,
  `SELECT USING FROM ztab INTO @wa.`,
  `SELECT UTCLONG FROM ztab INTO @wa.`,
  `SELECT VALID FROM ztab INTO @wa.`,
  `SELECT VALUES FROM ztab INTO @wa.`,
  `SELECT VAR FROM ztab INTO @wa.`,
  `SELECT VIA FROM ztab INTO @wa.`,
  `SELECT VIEW FROM ztab INTO @wa.`,
  `SELECT WEIGHT FROM ztab INTO @wa.`,
  `SELECT WITH FROM ztab INTO @wa.`,
  `SELECT WORD FROM ztab INTO @wa.`,
], "SELECT: keywords valid as column names", Statements.SelectLoop);

// keywords reserved in SELECT field list
statementExpectFail([
  `SELECT APPENDING FROM ztab INTO @wa.`,
  `SELECT AS FROM ztab INTO @wa.`,
  `SELECT CASE FROM ztab INTO @wa.`,
  `SELECT CONNECTION FROM ztab INTO @wa.`,
  `SELECT EXCEPT FROM ztab INTO @wa.`,
  `SELECT EXISTS FROM ztab INTO @wa.`,
  `SELECT FOR FROM ztab INTO @wa.`,
  `SELECT FROM FROM ztab INTO @wa.`,
  `SELECT HAVING FROM ztab INTO @wa.`,
  `SELECT INSERT FROM ztab INTO @wa.`,
  `SELECT INTERSECT FROM ztab INTO @wa.`,
  `SELECT INTO FROM ztab INTO @wa.`,
  `SELECT MODIFY FROM ztab INTO @wa.`,
  `SELECT NOT FROM ztab INTO @wa.`,
  `SELECT UNION FROM ztab INTO @wa.`,
  `SELECT WHEN FROM ztab INTO @wa.`,
  `SELECT WHERE FROM ztab INTO @wa.`,
], "SELECT: keywords reserved (cannot be column names)");

// keywords that are valid column names in SELECT SINGLE <kw> FROM ztab INTO @wa.
statementType([
  `SELECT SINGLE ABAP FROM ztab INTO @wa.`,
  `SELECT SINGLE ABBREVIATION FROM ztab INTO @wa.`,
  `SELECT SINGLE ACCEPTING FROM ztab INTO @wa.`,
  `SELECT SINGLE ACCESS FROM ztab INTO @wa.`,
  `SELECT SINGLE ADOPT FROM ztab INTO @wa.`,
  `SELECT SINGLE AHEAD FROM ztab INTO @wa.`,
  `SELECT SINGLE ALL FROM ztab INTO @wa.`,
  `SELECT SINGLE ALLOWED FROM ztab INTO @wa.`,
  `SELECT SINGLE ALPHANUM FROM ztab INTO @wa.`,
  `SELECT SINGLE AND FROM ztab INTO @wa.`,
  `SELECT SINGLE ANY FROM ztab INTO @wa.`,
  `SELECT SINGLE ANYWHERE FROM ztab INTO @wa.`,
  `SELECT SINGLE ASCENDING FROM ztab INTO @wa.`,
  `SELECT SINGLE ASSOCIATION FROM ztab INTO @wa.`,
  `SELECT SINGLE ASSOCIATIONS FROM ztab INTO @wa.`,
  `SELECT SINGLE AUTHORITY_CHECK FROM ztab INTO @wa.`,
  `SELECT SINGLE AVG FROM ztab INTO @wa.`,
  `SELECT SINGLE BALANCE FROM ztab INTO @wa.`,
  `SELECT SINGLE BASE FROM ztab INTO @wa.`,
  `SELECT SINGLE BEGINNING FROM ztab INTO @wa.`,
  `SELECT SINGLE BETWEEN FROM ztab INTO @wa.`,
  `SELECT SINGLE BITFIELD FROM ztab INTO @wa.`,
  `SELECT SINGLE BLOB FROM ztab INTO @wa.`,
  `SELECT SINGLE BREAKUP FROM ztab INTO @wa.`,
  `SELECT SINGLE BUFFER FROM ztab INTO @wa.`,
  `SELECT SINGLE BULK FROM ztab INTO @wa.`,
  `SELECT SINGLE BY FROM ztab INTO @wa.`,
  `SELECT SINGLE BYPASSING FROM ztab INTO @wa.`,
  `SELECT SINGLE CACHE FROM ztab INTO @wa.`,
  `SELECT SINGLE CALCULATION FROM ztab INTO @wa.`,
  `SELECT SINGLE CAST FROM ztab INTO @wa.`,
  `SELECT SINGLE CHAR FROM ztab INTO @wa.`,
  `SELECT SINGLE CHECK FROM ztab INTO @wa.`,
  `SELECT SINGLE CHILD FROM ztab INTO @wa.`,
  `SELECT SINGLE CLIENT FROM ztab INTO @wa.`,
  `SELECT SINGLE CLIENTS FROM ztab INTO @wa.`,
  `SELECT SINGLE CLNT FROM ztab INTO @wa.`,
  `SELECT SINGLE CLOB FROM ztab INTO @wa.`,
  `SELECT SINGLE CLOSE FROM ztab INTO @wa.`,
  `SELECT SINGLE COLUMNS FROM ztab INTO @wa.`,
  `SELECT SINGLE COMPARE FROM ztab INTO @wa.`,
  `SELECT SINGLE COMPARISON FROM ztab INTO @wa.`,
  `SELECT SINGLE CONDITION FROM ztab INTO @wa.`,
  `SELECT SINGLE CONVERT_LEGACY_COLUMNS FROM ztab INTO @wa.`,
  `SELECT SINGLE CORR FROM ztab INTO @wa.`,
  `SELECT SINGLE CORRESPONDING FROM ztab INTO @wa.`,
  `SELECT SINGLE CORR_SPEARMAN FROM ztab INTO @wa.`,
  `SELECT SINGLE COUNT FROM ztab INTO @wa.`,
  `SELECT SINGLE CREATE FROM ztab INTO @wa.`,
  `SELECT SINGLE CREATING FROM ztab INTO @wa.`,
  `SELECT SINGLE CROSS FROM ztab INTO @wa.`,
  `SELECT SINGLE CUKY FROM ztab INTO @wa.`,
  `SELECT SINGLE CURR FROM ztab INTO @wa.`,
  `SELECT SINGLE CURRENT FROM ztab INTO @wa.`,
  `SELECT SINGLE CURSOR FROM ztab INTO @wa.`,
  `SELECT SINGLE CYCLES FROM ztab INTO @wa.`,
  `SELECT SINGLE D16D FROM ztab INTO @wa.`,
  `SELECT SINGLE D16N FROM ztab INTO @wa.`,
  `SELECT SINGLE D16R FROM ztab INTO @wa.`,
  `SELECT SINGLE D34D FROM ztab INTO @wa.`,
  `SELECT SINGLE D34N FROM ztab INTO @wa.`,
  `SELECT SINGLE D34R FROM ztab INTO @wa.`,
  `SELECT SINGLE DATE FROM ztab INTO @wa.`,
  `SELECT SINGLE DATN FROM ztab INTO @wa.`,
  `SELECT SINGLE DATS FROM ztab INTO @wa.`,
  `SELECT SINGLE DEC FROM ztab INTO @wa.`,
  `SELECT SINGLE DECAY FROM ztab INTO @wa.`,
  `SELECT SINGLE DECFLOAT16 FROM ztab INTO @wa.`,
  `SELECT SINGLE DECFLOAT34 FROM ztab INTO @wa.`,
  `SELECT SINGLE DECLARE FROM ztab INTO @wa.`,
  `SELECT SINGLE DEFAULT FROM ztab INTO @wa.`,
  `SELECT SINGLE DELETE FROM ztab INTO @wa.`,
  `SELECT SINGLE DENSE_RANK FROM ztab INTO @wa.`,
  `SELECT SINGLE DEPTH FROM ztab INTO @wa.`,
  `SELECT SINGLE DESCENDING FROM ztab INTO @wa.`,
  `SELECT SINGLE DEVALUATE FROM ztab INTO @wa.`,
  `SELECT SINGLE DF16_DEC FROM ztab INTO @wa.`,
  `SELECT SINGLE DF16_RAW FROM ztab INTO @wa.`,
  `SELECT SINGLE DF34_DEC FROM ztab INTO @wa.`,
  `SELECT SINGLE DF34_RAW FROM ztab INTO @wa.`,
  `SELECT SINGLE DISTANCE FROM ztab INTO @wa.`,
  `SELECT SINGLE DUPLICATE FROM ztab INTO @wa.`,
  `SELECT SINGLE ELSE FROM ztab INTO @wa.`,
  `SELECT SINGLE END FROM ztab INTO @wa.`,
  `SELECT SINGLE ENTITY FROM ztab INTO @wa.`,
  `SELECT SINGLE ENTRIES FROM ztab INTO @wa.`,
  `SELECT SINGLE EQ FROM ztab INTO @wa.`,
  `SELECT SINGLE ERROR FROM ztab INTO @wa.`,
  `SELECT SINGLE ESCAPE FROM ztab INTO @wa.`,
  `SELECT SINGLE EXACT FROM ztab INTO @wa.`,
  `SELECT SINGLE EXCESS FROM ztab INTO @wa.`,
  `SELECT SINGLE EXPOSE FROM ztab INTO @wa.`,
  `SELECT SINGLE EXPOSING FROM ztab INTO @wa.`,
  `SELECT SINGLE EXTENDED FROM ztab INTO @wa.`,
  `SELECT SINGLE FACTOR FROM ztab INTO @wa.`,
  `SELECT SINGLE FETCH FROM ztab INTO @wa.`,
  `SELECT SINGLE FIELDS FROM ztab INTO @wa.`,
  `SELECT SINGLE FIRST FROM ztab INTO @wa.`,
  `SELECT SINGLE FIRST_VALUE FROM ztab INTO @wa.`,
  `SELECT SINGLE FLEXIBLE FROM ztab INTO @wa.`,
  `SELECT SINGLE FLTP FROM ztab INTO @wa.`,
  `SELECT SINGLE FOLLOWING FROM ztab INTO @wa.`,
  `SELECT SINGLE FORCE FROM ztab INTO @wa.`,
  `SELECT SINGLE FUZZY FROM ztab INTO @wa.`,
  `SELECT SINGLE GAUSSIAN FROM ztab INTO @wa.`,
  `SELECT SINGLE GE FROM ztab INTO @wa.`,
  `SELECT SINGLE GENERATE FROM ztab INTO @wa.`,
  `SELECT SINGLE GROUP FROM ztab INTO @wa.`,
  `SELECT SINGLE GROUPING FROM ztab INTO @wa.`,
  `SELECT SINGLE GT FROM ztab INTO @wa.`,
  `SELECT SINGLE HIERARCHY FROM ztab INTO @wa.`,
  `SELECT SINGLE HIERARCHY_ANCESTORS FROM ztab INTO @wa.`,
  `SELECT SINGLE HIERARCHY_ANCESTORS_AGGREGATE FROM ztab INTO @wa.`,
  `SELECT SINGLE HIERARCHY_DESCENDANTS FROM ztab INTO @wa.`,
  `SELECT SINGLE HIERARCHY_DESCENDANTS_AGGREGATE FROM ztab INTO @wa.`,
  `SELECT SINGLE HIERARCHY_SIBLINGS FROM ztab INTO @wa.`,
  `SELECT SINGLE HOLD FROM ztab INTO @wa.`,
  `SELECT SINGLE HOUSE FROM ztab INTO @wa.`,
  `SELECT SINGLE IDENTIFIER FROM ztab INTO @wa.`,
  `SELECT SINGLE IGNORE FROM ztab INTO @wa.`,
  `SELECT SINGLE IN FROM ztab INTO @wa.`,
  `SELECT SINGLE INCLUDING FROM ztab INTO @wa.`,
  `SELECT SINGLE INCREMENTAL FROM ztab INTO @wa.`,
  `SELECT SINGLE INDICATORS FROM ztab INTO @wa.`,
  `SELECT SINGLE INITIAL FROM ztab INTO @wa.`,
  `SELECT SINGLE INNER FROM ztab INTO @wa.`,
  `SELECT SINGLE INPUT FROM ztab INTO @wa.`,
  `SELECT SINGLE INT1 FROM ztab INTO @wa.`,
  `SELECT SINGLE INT2 FROM ztab INTO @wa.`,
  `SELECT SINGLE INT4 FROM ztab INTO @wa.`,
  `SELECT SINGLE INT8 FROM ztab INTO @wa.`,
  `SELECT SINGLE IS FROM ztab INTO @wa.`,
  `SELECT SINGLE IS_MASKED FROM ztab INTO @wa.`,
  `SELECT SINGLE JOIN FROM ztab INTO @wa.`,
  `SELECT SINGLE KEY FROM ztab INTO @wa.`,
  `SELECT SINGLE KEYS FROM ztab INTO @wa.`,
  `SELECT SINGLE LAG FROM ztab INTO @wa.`,
  `SELECT SINGLE LANG FROM ztab INTO @wa.`,
  `SELECT SINGLE LANGUAGE FROM ztab INTO @wa.`,
  `SELECT SINGLE LAST FROM ztab INTO @wa.`,
  `SELECT SINGLE LAST_VALUE FROM ztab INTO @wa.`,
  `SELECT SINGLE LE FROM ztab INTO @wa.`,
  `SELECT SINGLE LEAD FROM ztab INTO @wa.`,
  `SELECT SINGLE LEAVES FROM ztab INTO @wa.`,
  `SELECT SINGLE LEFT FROM ztab INTO @wa.`,
  `SELECT SINGLE LENGTH FROM ztab INTO @wa.`,
  `SELECT SINGLE LEVEL FROM ztab INTO @wa.`,
  `SELECT SINGLE LEVELED FROM ztab INTO @wa.`,
  `SELECT SINGLE LEVELS FROM ztab INTO @wa.`,
  `SELECT SINGLE LIKE FROM ztab INTO @wa.`,
  `SELECT SINGLE LINEAR FROM ztab INTO @wa.`,
  `SELECT SINGLE LOAD FROM ztab INTO @wa.`,
  `SELECT SINGLE LOCATOR FROM ztab INTO @wa.`,
  `SELECT SINGLE LOGARITHMIC FROM ztab INTO @wa.`,
  `SELECT SINGLE LT FROM ztab INTO @wa.`,
  `SELECT SINGLE MANY FROM ztab INTO @wa.`,
  `SELECT SINGLE MAPPING FROM ztab INTO @wa.`,
  `SELECT SINGLE MATCH FROM ztab INTO @wa.`,
  `SELECT SINGLE MATCHED FROM ztab INTO @wa.`,
  `SELECT SINGLE MATCHING FROM ztab INTO @wa.`,
  `SELECT SINGLE MAX FROM ztab INTO @wa.`,
  `SELECT SINGLE MEASURES FROM ztab INTO @wa.`,
  `SELECT SINGLE MEDIAN FROM ztab INTO @wa.`,
  `SELECT SINGLE MERGE FROM ztab INTO @wa.`,
  `SELECT SINGLE MIN FROM ztab INTO @wa.`,
  `SELECT SINGLE MINIMAL FROM ztab INTO @wa.`,
  `SELECT SINGLE MODE FROM ztab INTO @wa.`,
  `SELECT SINGLE MULTIPLE FROM ztab INTO @wa.`,
  `SELECT SINGLE NE FROM ztab INTO @wa.`,
  `SELECT SINGLE NEW FROM ztab INTO @wa.`,
  `SELECT SINGLE NEXT FROM ztab INTO @wa.`,
  `SELECT SINGLE NON FROM ztab INTO @wa.`,
  `SELECT SINGLE NOWAIT FROM ztab INTO @wa.`,
  `SELECT SINGLE NTILE FROM ztab INTO @wa.`,
  `SELECT SINGLE NULL FROM ztab INTO @wa.`,
  `SELECT SINGLE NULLS FROM ztab INTO @wa.`,
  `SELECT SINGLE NUMBER FROM ztab INTO @wa.`,
  `SELECT SINGLE NUMC FROM ztab INTO @wa.`,
  `SELECT SINGLE OF FROM ztab INTO @wa.`,
  `SELECT SINGLE OFF FROM ztab INTO @wa.`,
  `SELECT SINGLE OFFSET FROM ztab INTO @wa.`,
  `SELECT SINGLE ON FROM ztab INTO @wa.`,
  `SELECT SINGLE ONE FROM ztab INTO @wa.`,
  `SELECT SINGLE ONLY FROM ztab INTO @wa.`,
  `SELECT SINGLE OPEN FROM ztab INTO @wa.`,
  `SELECT SINGLE OPTIONS FROM ztab INTO @wa.`,
  `SELECT SINGLE OR FROM ztab INTO @wa.`,
  `SELECT SINGLE ORDER FROM ztab INTO @wa.`,
  `SELECT SINGLE ORPHANS FROM ztab INTO @wa.`,
  `SELECT SINGLE OTHER FROM ztab INTO @wa.`,
  `SELECT SINGLE OUTER FROM ztab INTO @wa.`,
  `SELECT SINGLE OVER FROM ztab INTO @wa.`,
  `SELECT SINGLE PACKAGE FROM ztab INTO @wa.`,
  `SELECT SINGLE PARENT FROM ztab INTO @wa.`,
  `SELECT SINGLE PARENTS FROM ztab INTO @wa.`,
  `SELECT SINGLE PARTITION FROM ztab INTO @wa.`,
  `SELECT SINGLE PERIOD FROM ztab INTO @wa.`,
  `SELECT SINGLE POSTCODE FROM ztab INTO @wa.`,
  `SELECT SINGLE PRECEDING FROM ztab INTO @wa.`,
  `SELECT SINGLE PRIMARY FROM ztab INTO @wa.`,
  `SELECT SINGLE PRIVILEGED FROM ztab INTO @wa.`,
  `SELECT SINGLE PRODUCT FROM ztab INTO @wa.`,
  `SELECT SINGLE PROVIDED FROM ztab INTO @wa.`,
  `SELECT SINGLE QUAN FROM ztab INTO @wa.`,
  `SELECT SINGLE RANK FROM ztab INTO @wa.`,
  `SELECT SINGLE RAW FROM ztab INTO @wa.`,
  `SELECT SINGLE RAWSTRING FROM ztab INTO @wa.`,
  `SELECT SINGLE READER FROM ztab INTO @wa.`,
  `SELECT SINGLE RECURSE FROM ztab INTO @wa.`,
  `SELECT SINGLE REDIRECTED FROM ztab INTO @wa.`,
  `SELECT SINGLE RESULT FROM ztab INTO @wa.`,
  `SELECT SINGLE RETAIN FROM ztab INTO @wa.`,
  `SELECT SINGLE RIGHT FROM ztab INTO @wa.`,
  `SELECT SINGLE ROOT FROM ztab INTO @wa.`,
  `SELECT SINGLE ROW FROM ztab INTO @wa.`,
  `SELECT SINGLE ROW_NUMBER FROM ztab INTO @wa.`,
  `SELECT SINGLE ROWS FROM ztab INTO @wa.`,
  `SELECT SINGLE SCALE FROM ztab INTO @wa.`,
  `SELECT SINGLE SCORE FROM ztab INTO @wa.`,
  `SELECT SINGLE SEARCH FROM ztab INTO @wa.`,
  `SELECT SINGLE SELECT FROM ztab INTO @wa.`,
  `SELECT SINGLE SET FROM ztab INTO @wa.`,
  `SELECT SINGLE SETS FROM ztab INTO @wa.`,
  `SELECT SINGLE SIBLINGS FROM ztab INTO @wa.`,
  `SELECT SINGLE SIMILARITY FROM ztab INTO @wa.`,
  `SELECT SINGLE SOME FROM ztab INTO @wa.`,
  `SELECT SINGLE SOURCE FROM ztab INTO @wa.`,
  `SELECT SINGLE SPANTREE FROM ztab INTO @wa.`,
  `SELECT SINGLE SPECIFIED FROM ztab INTO @wa.`,
  `SELECT SINGLE SPELL FROM ztab INTO @wa.`,
  `SELECT SINGLE SSTRING FROM ztab INTO @wa.`,
  `SELECT SINGLE START FROM ztab INTO @wa.`,
  `SELECT SINGLE STDDEV FROM ztab INTO @wa.`,
  `SELECT SINGLE STRING FROM ztab INTO @wa.`,
  `SELECT SINGLE STRING_AGG FROM ztab INTO @wa.`,
  `SELECT SINGLE STRUCTURE FROM ztab INTO @wa.`,
  `SELECT SINGLE SUBSTRING FROM ztab INTO @wa.`,
  `SELECT SINGLE SUBTOTAL FROM ztab INTO @wa.`,
  `SELECT SINGLE SUM FROM ztab INTO @wa.`,
  `SELECT SINGLE SYMMETRIC FROM ztab INTO @wa.`,
  `SELECT SINGLE TABLE FROM ztab INTO @wa.`,
  `SELECT SINGLE TEMPORAL FROM ztab INTO @wa.`,
  `SELECT SINGLE TEXT FROM ztab INTO @wa.`,
  `SELECT SINGLE THEN FROM ztab INTO @wa.`,
  `SELECT SINGLE THRESHOLD FROM ztab INTO @wa.`,
  `SELECT SINGLE TIMN FROM ztab INTO @wa.`,
  `SELECT SINGLE TIMS FROM ztab INTO @wa.`,
  `SELECT SINGLE TO FROM ztab INTO @wa.`,
  `SELECT SINGLE TOKEN FROM ztab INTO @wa.`,
  `SELECT SINGLE TOLERANCE FROM ztab INTO @wa.`,
  `SELECT SINGLE TOTAL FROM ztab INTO @wa.`,
  `SELECT SINGLE TRANSLATION FROM ztab INTO @wa.`,
  `SELECT SINGLE TYPE FROM ztab INTO @wa.`,
  `SELECT SINGLE UNBOUNDED FROM ztab INTO @wa.`,
  `SELECT SINGLE UNIT FROM ztab INTO @wa.`,
  `SELECT SINGLE UNTIL FROM ztab INTO @wa.`,
  `SELECT SINGLE UP FROM ztab INTO @wa.`,
  `SELECT SINGLE UPDATE FROM ztab INTO @wa.`,
  `SELECT SINGLE USING FROM ztab INTO @wa.`,
  `SELECT SINGLE UTCLONG FROM ztab INTO @wa.`,
  `SELECT SINGLE VALID FROM ztab INTO @wa.`,
  `SELECT SINGLE VALUES FROM ztab INTO @wa.`,
  `SELECT SINGLE VAR FROM ztab INTO @wa.`,
  `SELECT SINGLE VIA FROM ztab INTO @wa.`,
  `SELECT SINGLE VIEW FROM ztab INTO @wa.`,
  `SELECT SINGLE WEIGHT FROM ztab INTO @wa.`,
  `SELECT SINGLE WITH FROM ztab INTO @wa.`,
  `SELECT SINGLE WORD FROM ztab INTO @wa.`,
], "SELECT SINGLE: keywords valid as column names", Statements.Select);

// keywords reserved in SELECT SINGLE field list
statementExpectFail([
  `SELECT SINGLE APPENDING FROM ztab INTO @wa.`,
  `SELECT SINGLE CASE FROM ztab INTO @wa.`,
  `SELECT SINGLE CONNECTION FROM ztab INTO @wa.`,
  `SELECT SINGLE EXCEPT FROM ztab INTO @wa.`,
  `SELECT SINGLE EXISTS FROM ztab INTO @wa.`,
  `SELECT SINGLE FOR FROM ztab INTO @wa.`,
  `SELECT SINGLE FROM FROM ztab INTO @wa.`,
  `SELECT SINGLE HAVING FROM ztab INTO @wa.`,
  `SELECT SINGLE INSERT FROM ztab INTO @wa.`,
  `SELECT SINGLE INTERSECT FROM ztab INTO @wa.`,
  `SELECT SINGLE INTO FROM ztab INTO @wa.`,
  `SELECT SINGLE MODIFY FROM ztab INTO @wa.`,
  `SELECT SINGLE NOT FROM ztab INTO @wa.`,
  `SELECT SINGLE UNION FROM ztab INTO @wa.`,
  `SELECT SINGLE WHEN FROM ztab INTO @wa.`,
  `SELECT SINGLE WHERE FROM ztab INTO @wa.`,
], "SELECT SINGLE: keywords reserved (cannot be column names)");

statementVersionOk([
  // HIERARCHY generator: CHILD TO PARENT ASSOCIATION + START WHERE (minimal)
  {abap: `SELECT * FROM HIERARCHY( SOURCE ztab CHILD TO PARENT ASSOCIATION _parent START WHERE id = @lv_root ) AS h INTO TABLE @DATA(lt).`, ver: Version.v750},
  // HIERARCHY generator with SIBLINGS ORDER BY
  {abap: `SELECT * FROM HIERARCHY( SOURCE ztab CHILD TO PARENT ASSOCIATION _parent START WHERE id = @lv_root SIBLINGS ORDER BY sort_key ASCENDING ) AS h INTO TABLE @DATA(lt).`, ver: Version.v750},
  // HIERARCHY generator with DEPTH
  {abap: `SELECT * FROM HIERARCHY( SOURCE ztab CHILD TO PARENT ASSOCIATION _parent START WHERE id = @lv_root DEPTH 3 ) AS h INTO TABLE @DATA(lt).`, ver: Version.v750},
  // HIERARCHY generator with MULTIPLE PARENTS NOT ALLOWED
  {abap: `SELECT * FROM HIERARCHY( SOURCE ztab CHILD TO PARENT ASSOCIATION _parent START WHERE id = @lv_root MULTIPLE PARENTS NOT ALLOWED ) AS h INTO TABLE @DATA(lt).`, ver: Version.v750},
  // HIERARCHY generator with MULTIPLE PARENTS ALLOWED
  {abap: `SELECT * FROM HIERARCHY( SOURCE ztab CHILD TO PARENT ASSOCIATION _parent START WHERE id = @lv_root MULTIPLE PARENTS ALLOWED ) AS h INTO TABLE @DATA(lt).`, ver: Version.v750},
  // HIERARCHY generator with MULTIPLE PARENTS LEAVES ONLY
  {abap: `SELECT * FROM HIERARCHY( SOURCE ztab CHILD TO PARENT ASSOCIATION _parent START WHERE id = @lv_root MULTIPLE PARENTS LEAVES ONLY ) AS h INTO TABLE @DATA(lt).`, ver: Version.v750},
  // HIERARCHY generator with ORPHAN IGNORE
  {abap: `SELECT * FROM HIERARCHY( SOURCE ztab CHILD TO PARENT ASSOCIATION _parent START WHERE id = @lv_root ORPHAN IGNORE ) AS h INTO TABLE @DATA(lt).`, ver: Version.v750},
  // HIERARCHY generator with ORPHAN ERROR
  {abap: `SELECT * FROM HIERARCHY( SOURCE ztab CHILD TO PARENT ASSOCIATION _parent START WHERE id = @lv_root ORPHAN ERROR ) AS h INTO TABLE @DATA(lt).`, ver: Version.v750},
  // HIERARCHY generator with ORPHAN ROOT
  {abap: `SELECT * FROM HIERARCHY( SOURCE ztab CHILD TO PARENT ASSOCIATION _parent START WHERE id = @lv_root ORPHAN ROOT ) AS h INTO TABLE @DATA(lt).`, ver: Version.v750},
  // HIERARCHY generator with CYCLE BREAKUP
  {abap: `SELECT * FROM HIERARCHY( SOURCE ztab CHILD TO PARENT ASSOCIATION _parent START WHERE id = @lv_root CYCLE BREAKUP ) AS h INTO TABLE @DATA(lt).`, ver: Version.v750},
  // HIERARCHY generator with CYCLE ERROR
  {abap: `SELECT * FROM HIERARCHY( SOURCE ztab CHILD TO PARENT ASSOCIATION _parent START WHERE id = @lv_root CYCLE ERROR ) AS h INTO TABLE @DATA(lt).`, ver: Version.v750},
  // HIERARCHY generator with CACHE ON
  {abap: `SELECT * FROM HIERARCHY( SOURCE ztab CHILD TO PARENT ASSOCIATION _parent START WHERE id = @lv_root CACHE ON ) AS h INTO TABLE @DATA(lt).`, ver: Version.v750},
  // HIERARCHY generator with CACHE FORCE
  {abap: `SELECT * FROM HIERARCHY( SOURCE ztab CHILD TO PARENT ASSOCIATION _parent START WHERE id = @lv_root CACHE FORCE ) AS h INTO TABLE @DATA(lt).`, ver: Version.v750},
  // HIERARCHY generator with GENERATE SPANTREE
  {abap: `SELECT * FROM HIERARCHY( SOURCE ztab CHILD TO PARENT ASSOCIATION _parent START WHERE id = @lv_root GENERATE SPANTREE ) AS h INTO TABLE @DATA(lt).`, ver: Version.v750},
  // HIERARCHY generator with PERIOD / VALID
  {abap: `SELECT * FROM HIERARCHY( SOURCE ztab CHILD TO PARENT ASSOCIATION _parent PERIOD FROM valid_from TO valid_to VALID FROM @lv_from TO @lv_to START WHERE id = @lv_root ) AS h INTO TABLE @DATA(lt).`, ver: Version.v750},
  // HIERARCHY generator: complex WHERE condition
  {abap: `SELECT * FROM HIERARCHY( SOURCE ztab CHILD TO PARENT ASSOCIATION _parent START WHERE id = @lv_root AND level = 0 ) AS h INTO TABLE @DATA(lt).`, ver: Version.v750},
  // HIERARCHY accessor: HIERARCHY_DESCENDANTS
  {abap: `SELECT * FROM HIERARCHY_DESCENDANTS( SOURCE ztab START WHERE id = @lv_root ) AS h INTO TABLE @DATA(lt).`, ver: Version.v750},
  // HIERARCHY accessor: HIERARCHY_ANCESTORS
  {abap: `SELECT * FROM HIERARCHY_ANCESTORS( SOURCE ztab START WHERE id = @lv_node ) AS h INTO TABLE @DATA(lt).`, ver: Version.v750},
  // HIERARCHY accessor: HIERARCHY_SIBLINGS
  {abap: `SELECT * FROM HIERARCHY_SIBLINGS( SOURCE ztab START WHERE id = @lv_node ) AS h INTO TABLE @DATA(lt).`, ver: Version.v750},
  // HIERARCHY accessor with DISTANCE FROM
  {abap: `SELECT * FROM HIERARCHY_DESCENDANTS( SOURCE ztab START WHERE id = @lv_root DISTANCE FROM 1 ) AS h INTO TABLE @DATA(lt).`, ver: Version.v750},
  // HIERARCHY accessor with DISTANCE TO
  {abap: `SELECT * FROM HIERARCHY_DESCENDANTS( SOURCE ztab START WHERE id = @lv_root DISTANCE TO 3 ) AS h INTO TABLE @DATA(lt).`, ver: Version.v750},
  // HIERARCHY accessor with DISTANCE FROM ... TO
  {abap: `SELECT * FROM HIERARCHY_DESCENDANTS( SOURCE ztab START WHERE id = @lv_root DISTANCE FROM 1 TO 3 ) AS h INTO TABLE @DATA(lt).`, ver: Version.v750},
  // HIERARCHY aggregate: HIERARCHY_DESCENDANTS_AGGREGATE with MEASURES
  {abap: `SELECT * FROM HIERARCHY_DESCENDANTS_AGGREGATE( SOURCE ztab START WHERE id = @lv_root MEASURES SUM( amount ) AS total ) AS h INTO TABLE @DATA(lt).`, ver: Version.v750},
  // HIERARCHY aggregate: HIERARCHY_ANCESTORS_AGGREGATE with MEASURES
  {abap: `SELECT * FROM HIERARCHY_ANCESTORS_AGGREGATE( SOURCE ztab START WHERE id = @lv_root MEASURES SUM( amount ) AS total ) AS h INTO TABLE @DATA(lt).`, ver: Version.v750},
  // HIERARCHY aggregate with multiple measures
  {abap: `SELECT * FROM HIERARCHY_DESCENDANTS_AGGREGATE( SOURCE ztab START WHERE id = @lv_root MEASURES SUM( amount ) AS total , COUNT( * ) AS cnt ) AS h INTO TABLE @DATA(lt).`, ver: Version.v750},
  // HIERARCHY aggregate with WHERE
  {abap: `SELECT * FROM HIERARCHY_DESCENDANTS_AGGREGATE( SOURCE ztab START WHERE id = @lv_root MEASURES SUM( amount ) AS total WHERE level > 0 ) AS h INTO TABLE @DATA(lt).`, ver: Version.v750},
  // HIERARCHY aggregate with WITH SUBTOTAL
  {abap: `SELECT * FROM HIERARCHY_DESCENDANTS_AGGREGATE( SOURCE ztab START WHERE id = @lv_root MEASURES SUM( amount ) AS total WITH SUBTOTAL ) AS h INTO TABLE @DATA(lt).`, ver: Version.v750},
  // HIERARCHY aggregate with JOIN
  {abap: `SELECT * FROM HIERARCHY_DESCENDANTS_AGGREGATE( SOURCE ztab START WHERE id = @lv_root JOIN zdata ON zdata~id = id MEASURES SUM( amount ) AS total ) AS h INTO TABLE @DATA(lt).`, ver: Version.v750},
  // HIERARCHY aggregate without START WHERE (optional)
  {abap: `SELECT * FROM HIERARCHY_DESCENDANTS_AGGREGATE( SOURCE ztab MEASURES SUM( amount ) AS total ) AS h INTO TABLE @DATA(lt).`, ver: Version.v750},
], "SELECT hierarchy source functions", Statements.Select);

statementVersionOk([
  // SIBLINGS ORDER BY single field
  {abap: `SELECT * FROM HIERARCHY( SOURCE ztab CHILD TO PARENT ASSOCIATION _parent START WHERE col1 = 'X' SIBLINGS ORDER BY col2 ) INTO TABLE @DATA(result).`, ver: Version.v750},
  // LOAD INCREMENTAL
  {abap: `SELECT * FROM HIERARCHY( SOURCE ztab CHILD TO PARENT ASSOCIATION _parent START WHERE id = @lv_root SIBLINGS ORDER BY col1 LOAD INCREMENTAL ) INTO TABLE @result.`, ver: Version.v750},
  // LOAD BULK
  {abap: `SELECT * FROM HIERARCHY( SOURCE ztab CHILD TO PARENT ASSOCIATION _parent START WHERE id = @lv_root SIBLINGS ORDER BY col1 LOAD BULK ) INTO TABLE @result.`, ver: Version.v750},
  // LOAD @var
  {abap: `SELECT * FROM HIERARCHY( SOURCE ztab CHILD TO PARENT ASSOCIATION _parent START WHERE id = @lv_root SIBLINGS ORDER BY col1 LOAD @load ) INTO TABLE @result.`, ver: Version.v750},
  // RETAIN NULLS @var (leveled)
  {abap: `SELECT * FROM HIERARCHY( SOURCE ztab LEVELS ( a, b, c ) RETAIN NULLS @n ) INTO TABLE @DATA(t).`, ver: Version.v750},
  // RETAIN NULLS with SIBLINGS ORDER BY before it
  {abap: `SELECT * FROM HIERARCHY( SOURCE ztab LEVELS ( a, b, c ) SIBLINGS ORDER BY a DESCENDING, b ASCENDING RETAIN NULLS @n ) INTO TABLE @DATA(t).`, ver: Version.v750},
  // RETAIN NULLS with CACHE before it
  {abap: `SELECT * FROM HIERARCHY( SOURCE ztab LEVELS ( a, b, c ) CACHE ON RETAIN NULLS @n ) INTO TABLE @DATA(t).`, ver: Version.v750},
  // LEVELS with CTE name as source
  {abap: `SELECT * FROM HIERARCHY( SOURCE +a LEVELS ( a, b, c ) SIBLINGS ORDER BY a ) INTO TABLE @DATA(t).`, ver: Version.v750},
], "SELECT hierarchy source functions (kernel-derived, INTO TABLE)", Statements.Select);

statementVersionOk([
  // PERIOD/VALID + START WHERE
  {abap: `SELECT 1 FROM HIERARCHY( SOURCE ztab CHILD TO PARENT ASSOCIATION _self PERIOD FROM valid_from TO valid_to VALID FROM @timestamp TO @timestamp START WHERE 1 = 0 ) INTO @result.`, ver: Version.v750},
  // SOURCE with alias
  {abap: `SELECT * FROM HIERARCHY( SOURCE ztab AS foo CHILD TO PARENT ASSOCIATION _parent START WHERE foo~col1 = 'X' SIBLINGS ORDER BY foo~col3 ) INTO @result.`, ver: Version.v750},
  // SOURCE with alias + ORDER BY PRIMARY KEY
  {abap: `SELECT * FROM HIERARCHY( SOURCE ztab AS foo CHILD TO PARENT ASSOCIATION _parent START WHERE foo~col1 = 'X' SIBLINGS ORDER BY PRIMARY KEY ) INTO @result.`, ver: Version.v750},
  // aggregate: WITH SUBTOTAL
  {abap: `SELECT * FROM HIERARCHY_DESCENDANTS_AGGREGATE( SOURCE ztab MEASURES COUNT( * ) AS cnt WITH SUBTOTAL ) INTO @bar.`, ver: Version.v750},
  // aggregate: JOIN
  {abap: `SELECT * FROM HIERARCHY_DESCENDANTS_AGGREGATE( SOURCE ztab JOIN zdata ON ztab~id = zdata~fk MEASURES COUNT( * ) AS cnt ) INTO @wa.`, ver: Version.v750},
  // aggregate: WHERE
  {abap: `SELECT * FROM HIERARCHY_DESCENDANTS_AGGREGATE( SOURCE ztab MEASURES COUNT( * ) AS cnt WHERE id > 0 ) INTO @wa.`, ver: Version.v750},
  // aggregate: WITH BALANCE WITH NOT MATCHED WITH TOTAL
  {abap: `SELECT * FROM HIERARCHY_DESCENDANTS_AGGREGATE( SOURCE ztab MEASURES COUNT( * ) AS cnt WITH BALANCE WITH NOT MATCHED WITH TOTAL ) INTO @wa.`, ver: Version.v750},
], "SELECT hierarchy source functions (kernel-derived, INTO work area)", Statements.SelectLoop);

