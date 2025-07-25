import {statementType, statementVersion, statementVersionFail} from "../_utils";
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
  "SELECT field FROM table INTO TABLE @DATA(lt_tab) OFFSET 22.",
  "SELECT bname, bcode FROM usr02 GROUP BY bname, bcode INTO TABLE @DATA(result).",

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

  `SELECT DISTINCT matnr
  FROM zfoobar1
  WHERE timestamp > @iv_timestamp_from
  AND   timestamp <= @iv_timestamp_to
  UNION DISTINCT
  SELECT DISTINCT matnr
  FROM zfoobar2
  WHERE timestamp > @iv_timestamp_from
  AND   timestamp <= @iv_timestamp_to.
  `,

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
  `SELECT SINGLE * FROM usr02 INTO @DATA(sdf) WHERE bname = @text-001.`,
  "SELECT SUM( (l_field) ) INTO l_value FROM (l_table).",
  "SELECT COUNT( DISTINCT ( field ) ) FROM voided INTO @DATA(lv_result).",
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
];

statementType(tests, "SELECT", Statements.Select);

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
];

statementVersion(versions, "SELECT", Statements.Select);

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
];

statementVersionFail(versionsFail, "SELECT");