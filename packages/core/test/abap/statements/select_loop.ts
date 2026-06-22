/* eslint-disable max-len */
import {statementType, statementVersionOk, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Version, Release, LanguageVersion} from "../../../src/version";

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

  `SELECT * FROM zfoo PACKAGE SIZE 5000 INTO TABLE tab
    WHERE compdate < del_date
    AND   status BETWEEN 200 AND 300
    AND   id IN lr.`,

  `SELECT a~lgnum            AS lgnum,
    a~lgtyp            AS lgtyp,
    a~access_group     AS aisle,
    SUM( CAST( CAST( a~par_value AS NUMC ) AS INT8 ) ) AS loc_cnt_empty_total
    FROM /mycomp/stmval AS a
    WHERE a~lgnum = 'DE01'
    AND a~lgtyp = 'LG01'
    AND a~par_name = 'TEST'
    GROUP BY a~lgnum, a~lgtyp, a~access_group
    INTO CORRESPONDING FIELDS OF @ls_aisle_ptwy_index.`,

  `SELECT 'X'
  FROM /mycomp/wplog
 WHERE lgnum      = @ms_wplace-lgnum
   AND wp_id      = @ms_wplace-wp_id
   AND uname      = @iv_uname
   AND logout_ts  = @space
  INTO @DATA(lv_exists).`,

  `SELECT FROM zsdfsd
      FIELDS val
      WHERE activ    EQ @abap_true
      ORDER BY PRIMARY KEY
      INTO @DATA(lv_crmode)
      UP TO 1 ROWS.`,

  `SELECT FROM vbpa
      FIELDS *
      WHERE vbeln EQ @ms_vbrk-vbeln
      AND parvw EQ @sdfsdf
      ORDER BY posnr ASCENDING
      INTO @sdfsdf
      UP TO 1 ROWS.`,

  `SELECT @abap_true FROM edimsg
      INTO @DATA(l_exist)
      UP TO 1 ROWS
      WHERE mestyp = @i_message_type
      ORDER BY PRIMARY KEY.`,

  `SELECT FROM sdffds
    FIELDS *
    WHERE sdf EQ @lv_sdfsd
    INTO CORRESPONDING FIELDS OF @sdfsdf.`,

  `SELECT FROM ekkn AS e
     INNER JOIN ekko AS k ON e~ebeln EQ k~ebeln
     INNER JOIN vbkd AS v ON k~ebeln EQ v~bstkd
     FIELDS e~vbeln
     FOR ALL ENTRIES IN @mt_lips
     WHERE v~vbeln EQ @mt_lips-vgbel
     INTO @DATA(sdf)
     UP TO 1 ROWS.`,

  `SELECT SUM( field )
         INTO sum
         FROM ztab
         WHERE matnr = matnr
         AND   werks = werks
         GROUP BY matnr.`,

  `SELECT SUM( labst )
    INTO <foo>-labst UP TO 1 ROWS
    FROM mard
    WHERE matnr = <mooo>-matnr
      AND werks = <mooo>-werks
      AND lgort = <mooo>-lgpro
    GROUP BY matnr.`,

  `SELECT @me->v_werks AS werks, lgort, matnr, labst
    INTO @lt_foo
    FROM tab
    WHERE (lv_where_f).`,

  `SELECT MAX( lfgja )
    INTO var1
    FROM mardh
    GROUP BY matnr.`,

  `SELECT MAX( lfgja )
    INTO var1
    FROM mardh CLIENT SPECIFIED
    GROUP BY matnr.`,

  `SELECT MAX( lfgja ) MAX( lfmon )
    INTO (var1, var2)
    FROM mardh
    GROUP BY matnr.`,

  `SELECT mkpf~bldat mseg~mblnr mseg~mjahr mseg~bwart
     INTO CORRESPONDING FIELDS OF wa_mov
     FROM mkpf INNER JOIN mseg
     ON mkpf~mandt = mseg~mandt
     AND mkpf~mjahr = mseg~mjahr
     CONNECTION (dbcon)
     WHERE mkpf~bldat IN s_bldat
     AND mseg~bwart IN s_bwart
     AND mkpf~mjahr IN s_mjahr
     AND mseg~werks EQ i_werks
     AND (gwc_werks_mseg) %_HINTS ORACLE 'HELLO'.`,

  `SELECT
    SUM( ztab_agg~value1 )
    SUM( ztab_agg~value2 )
      FROM ztab_agg
      INTO ( ls_out-value1,
       ls_out-value2 )
     WHERE key1 = ls_in-key1
       AND key2 = ls_in-key2
       AND key3 = ls_in-key3
       AND key4 = ls_in-key4
       AND key5 = lv_key5
       GROUP BY key1
          key2
          key3
          key4
          key5.`,

  `SELECT  t_hdr~id_main
            t_hdr~id_item
            t_attr~flag_a
            t_attr~value_a
            t_mat~text_a
            t_qty~num_a
            t_evt~counter_a
            t_evt~date_a
            t_evt~ref_a
            t_evt~qty_check
            t_qty~amount_a
            t_qty~unit_a
            t_vendor~id_vendor
            INTO CORRESPONDING FIELDS OF ls_result
            FROM ( ( ( ( ( ( ( zt_header AS t_hdr
                   INNER JOIN zt_event AS t_evt
                     ON  t_hdr~id_main = t_evt~id_main
                     AND t_hdr~id_item = t_evt~id_item )
                   INNER JOIN zt_attr AS t_attr
                     ON  t_attr~id_main = t_hdr~id_main
                     AND t_attr~id_item = t_hdr~id_item
                     AND t_attr~key_a = t_hdr~key_a     )
                   INNER JOIN zt_material  AS t_mat
                     ON  t_hdr~id_item = t_mat~matnr    )
                   INNER JOIN zt_link AS t_link
                     ON  t_hdr~id_item = t_link~matnr
                     AND t_hdr~id_main = t_link~id_main )
                   INNER JOIN zt_map AS t_map
                     ON  t_link~doc_no = t_map~doc_no
                     AND t_link~doc_pos = t_map~doc_pos )
                   INNER JOIN zt_qty AS t_qty
                     ON  t_map~doc_no = t_qty~doc_no
                     AND t_map~doc_pos = t_qty~doc_pos
                     AND t_map~doc_sub = t_qty~doc_sub  )
                   INNER JOIN zt_vendor AS t_vendor
                     ON  t_hdr~id_main = t_vendor~id_main
                     AND t_hdr~id_item = t_vendor~id_item
                     AND t_hdr~key_a = t_vendor~key_a
                     AND t_map~site_id = t_vendor~cust_id )
            WHERE t_hdr~id_main EQ ls_input-id_main
            AND   t_hdr~id_item IN lt_item_rng
            AND   t_hdr~group_a EQ space
            AND   t_evt~ref_a IN lt_ref_rng
            AND   t_map~site_id IN lt_site_rng
            AND   t_vendor~client_id = ls_input-client_id
            AND   t_qty~amount_a IN lt_amt_rng.`,

  `SELECT f1 COUNT(*) INTO ( wa-id1 , wa-id2 ) UP TO 3 ROWS FROM ztab GROUP BY f1 HAVING f1 = 5.`,

  `SELECT f1 FROM ztab GROUP BY f1 HAVING f1 = ( SELECT MAX( f1 ) FROM ztab WHERE f2 = iv ) INTO CORRESPONDING FIELDS OF ls.`,

  `SELECT DISTINCT (lv_fields) FROM ztab INTO lv_wa GROUP BY (lv_fields) HAVING NOT (lv_where).`,

  `SELECT ( col1 - col2 ) * ( col3 - col4 ) AS result FROM ztab INTO wa.`,
];

statementType(tests, "SELECT loop", Statements.SelectLoop);

const versions = [
  {abap: `SELECT FROM ztable FIELDS field1 WHERE field2 = @lv_val INTO @DATA(ls_row).`, rel: Release.v750},
  {abap: `SELECT FROM ztable FIELDS field1, field2 WHERE status = @lv_status INTO @DATA(ls_result).`, rel: Release.v750},
  {abap: `SELECT a~field1 b~field2 INTO ( lv_val1, lv_val2 ) FROM ztab1 AS a INNER JOIN ztab2 AS b ON a~id = b~id
    WHERE a~type = '035' AND b~spras EQ sy-langu.`, rel: Release.v750},
  {abap: `SELECT a~field1 b~field2 INTO ( lv_val1, lv_val2 ) FROM ztab1 AS a INNER JOIN ztab2 AS b ON a~id = b~id
    WHERE a~type = '035' AND b~spras EQ sy-langu.`, rel: Version.OpenABAP},
];

statementVersionOk(versions, "SELECT loop", Statements.SelectLoop);

statementVersionOk([
  {abap: `SELECT \\_assoc1-col FROM ztab1 INTO @DATA(r).`, rel: Release.v740sp05},
  {abap: `SELECT key_property, \\_assoc1-col FROM ztab1 INTO @DATA(r).`, rel: Release.v740sp05},
  {abap: `SELECT \\_assoc1-col AS c FROM ztab1 INTO @DATA(r).`, rel: Release.v740sp05},
  {abap: `SELECT \\_assoc1\\_assoc2-col FROM ztab1 INTO @DATA(r).`, rel: Release.v740sp05},
  {abap: `SELECT t1~\\_assoc1-col FROM ztab1 AS t1 INTO @DATA(r).`, rel: Release.v740sp05},
  {abap: `SELECT \\_assoc1[ key1 < 3 ]-col FROM ztab1 INTO @DATA(r).`, rel: Release.v751},
  {abap: `SELECT \\_assoc1[ WHERE key1 < 3 ]-col FROM ztab1 INTO @DATA(r).`, rel: Release.v751},
  {abap: `SELECT \\_assoc1[ INNER WHERE key1 < 3 ]-col FROM ztab1 INTO @DATA(r).`, rel: Release.v751},
  {abap: `SELECT \\_assoc1[ ONE TO ONE ]-col FROM ztab1 INTO @DATA(r).`, rel: Release.v751},
  {abap: `SELECT \\_assoc1[ LEFT OUTER WHERE key1 < 3 ]-col FROM ztab1 INTO @DATA(r).`, rel: Release.v751},
  {abap: `SELECT * FROM ztab1 \\_assoc1 WHERE col4 = @sy-uname INTO @DATA(r).`, rel: Release.v740sp05},
  {abap: `SELECT * FROM ztab1\\_assoc1 WHERE col4 = @sy-uname INTO @DATA(r).`, rel: Release.v740sp05},
  {abap: `SELECT * FROM ztab1 \\_assoc1( col1 = 'AB', col2 = 3 ) WHERE col4 = @sy-uname INTO @DATA(r).`, rel: Release.v751},
  {abap: `SELECT * FROM ztab1 \\_assoc1[ col4 = @sy-uname ] WHERE col4 = @sy-uname INTO @DATA(r).`, rel: Release.v751},
  {abap: `SELECT * FROM ztab1 \\_assoc1[ INNER ] WHERE col4 = @sy-uname INTO @DATA(r).`, rel: Release.v751},
  {abap: `SELECT * FROM ztab1 \\_assoc1 \\_assoc2 WHERE col4 = @sy-uname INTO @DATA(r).`, rel: Release.v740sp05},
], "SELECT loop association path expressions", Statements.SelectLoop);

statementVersionFail([
  {abap: `SELECT * FROM ztab1 \\_assoc1 ( col1 = 'AB' ) WHERE col4 = @sy-uname INTO @DATA(r).`, rel: Release.v751},
  {abap: `SELECT * FROM ztab1 \\_assoc1 [ col4 = @sy-uname ] WHERE col4 = @sy-uname INTO @DATA(r).`, rel: Release.v751},
  {abap: `SELECT \\_assoc1 [ key1 < 3 ]-col FROM ztab1 INTO @DATA(r).`, rel: Release.v751},
], "SELECT loop association path invalid spacing");

const privilegedVersions = [
  {abap: `SELECT * FROM ztab INTO TABLE lt_tab PACKAGE SIZE 100 WHERE id = lv_id PRIVILEGED ACCESS.`, rel: Release.v758},
  {abap: `SELECT field APPENDING TABLE lt FROM ztab PACKAGE SIZE 10 WHERE id = lv_id PRIVILEGED ACCESS.`, rel: Release.v758},
];

statementVersionOk(privilegedVersions, "SELECT loop privileged access", Statements.SelectLoop);

const privilegedVersionsFail = [
  {abap: `SELECT * FROM ztab INTO TABLE lt_tab PACKAGE SIZE 100 WHERE id = lv_id PRIVILEGED ACCESS.`, rel: Release.v756},
  {abap: `SELECT * FROM ztab INTO TABLE lt_tab PACKAGE SIZE 100 WHERE id = lv_id PRIVILEGED ACCESS.`, rel: Release.v757},
];

statementVersionFail(privilegedVersionsFail, "SELECT loop privileged access");

const optionsVersions = [
  {abap: `SELECT * FROM ztab ORDER BY PRIMARY KEY INTO @DATA(wa) OPTIONS USING ALL CLIENTS.`, rel: Release.v758},
  {abap: `SELECT * FROM veri_VER56133_cs ORDER BY PRIMARY KEY INTO @DATA(wa2) OPTIONS USING ALL CLIENTS.`, rel: Release.v758},
  {abap: `SELECT * FROM ztab INTO TABLE lt_tab PACKAGE SIZE 100 WHERE id = lv_id OPTIONS PRIVILEGED ACCESS.`, rel: Release.v758},
  {abap: `SELECT * FROM ztab INTO TABLE lt_tab PACKAGE SIZE 100 WHERE id = lv_id OPTIONS BYPASSING BUFFER.`, rel: Release.v758},
  {abap: `SELECT * FROM ztab INTO TABLE lt_tab PACKAGE SIZE 100 WHERE id = lv_id OPTIONS CONNECTION foo.`, rel: Release.v758},
  {abap: `SELECT * FROM ztab INTO TABLE lt_tab PACKAGE SIZE 100 OPTIONS USING ALL CLIENTS PRIVILEGED ACCESS.`, rel: Release.v758},
  {abap: `SELECT * FROM ztab INTO TABLE lt_tab PACKAGE SIZE 100 OPTIONS USING ALL CLIENTS BYPASSING BUFFER.`, rel: Release.v758},
  {abap: `SELECT * FROM ztab INTO TABLE lt_tab PACKAGE SIZE 100 OPTIONS USING ALL CLIENTS PRIVILEGED ACCESS BYPASSING BUFFER.`, rel: Release.v758},
  {abap: `SELECT * FROM ztab INTO TABLE lt_tab PACKAGE SIZE 100 OPTIONS USING ALL CLIENTS PRIVILEGED ACCESS CONNECTION foo.`, rel: Release.v758},
  {abap: `SELECT * FROM ztab INTO TABLE lt_tab PACKAGE SIZE 100 OPTIONS USING ALL CLIENTS PRIVILEGED ACCESS BYPASSING BUFFER CONNECTION foo.`, rel: Release.v758},
  {abap: `SELECT * FROM ztab INTO TABLE lt_tab PACKAGE SIZE 100 OPTIONS PRIVILEGED ACCESS BYPASSING BUFFER.`, rel: Release.v758},
  {abap: `SELECT * FROM ztab INTO TABLE lt_tab PACKAGE SIZE 100 OPTIONS PRIVILEGED ACCESS CONNECTION foo.`, rel: Release.v758},
  {abap: `SELECT * FROM ztab INTO TABLE lt_tab PACKAGE SIZE 100 OPTIONS BYPASSING BUFFER CONNECTION foo.`, rel: Release.v758},
  {abap: `SELECT * FROM ztab INTO TABLE lt_tab PACKAGE SIZE 100 OPTIONS PRIVILEGED ACCESS BYPASSING BUFFER CONNECTION foo.`, rel: Release.v758},
];

statementVersionOk(optionsVersions, "SELECT loop OPTIONS clause", Statements.SelectLoop);

const optionsVersionsFail = [
  {abap: `SELECT * FROM ztab INTO @DATA(wa) OPTIONS USING ALL CLIENTS.`, rel: Release.v757},
];

statementVersionFail(optionsVersionsFail, "SELECT loop OPTIONS clause");

const isLoopTests = [
  `SELECT foo FROM ztab.`,
  `SELECT foo bar FROM ztab WHERE id = 1.`,
  `SELECT foo FROM ztab INTO @wa.`,
  `SELECT foo FROM ztab INTO wa.`,
  `SELECT foo FROM ztab INTO CORRESPONDING FIELDS OF @wa.`,
  `SELECT foo bar FROM ztab INTO (lv1, lv2).`,
  `SELECT * FROM ztab INTO TABLE @lt_t PACKAGE SIZE 10.`,
  `SELECT * FROM ztab APPENDING TABLE @lt_t PACKAGE SIZE 10.`,
  `SELECT * FROM ztab INTO TABLE @lt_t PACKAGE SIZE 10 WHERE id = 1.`,
  `SELECT * INTO CORRESPONDING FIELDS OF TABLE @lt_t PACKAGE SIZE 10 FROM ztab WHERE id = 1.`,
  `SELECT COUNT(*) FROM ztab GROUP BY id.`,
  `SELECT id COUNT(*) FROM ztab GROUP BY id HAVING COUNT(*) > 1.`,
  `SELECT foo FROM ztab ORDER BY PRIMARY KEY.`,
  `SELECT foo bar FROM ztab ORDER BY foo.`,
  `SELECT foo FROM ztab INTO @wa UP TO 1 ROWS.`,
];
statementType(isLoopTests, "isSelectLoop → SelectLoop", Statements.SelectLoop);

const isNotLoopTests = [
  `SELECT SINGLE foo FROM ztab INTO @wa.`,
  `SELECT SINGLE * FROM ztab INTO @wa WHERE id = 1.`,
  `SELECT SINGLE foo FROM ztab INTO wa.`,
  `SELECT foo FROM ztab UNION SELECT foo FROM ztab2 INTO TABLE @lt_t.`,
  `SELECT foo FROM ztab UNION ALL SELECT foo FROM ztab2 INTO TABLE @lt_t.`,
  `SELECT * FROM ztab INTO TABLE @lt_t.`,
  `SELECT * FROM ztab APPENDING TABLE @lt_t WHERE id = 1.`,
  `SELECT foo FROM ztab INTO TABLE lt_t.`,
  `SELECT foo FROM ztab APPENDING TABLE @lt_t.`,
  `SELECT foo FROM ztab APPENDING CORRESPONDING FIELDS OF TABLE @lt_t.`,
  `SELECT COUNT(*) FROM ztab INTO @lv_cnt.`,
  `SELECT COUNT( * ) FROM ztab INTO lv_cnt WHERE id = 1.`,
  `SELECT COUNT(*) FROM ztab.`,
  `SELECT COUNT(*) FROM ztab HAVING COUNT(*) > 1.`,
  `SELECT COUNT(*) FROM ztab ORDER BY PRIMARY KEY.`,
  `SELECT SUM( val ) FROM ztab INTO lv_sum.`,
  `SELECT MAX( val ) FROM ztab INTO lv_max.`,
  `SELECT MIN( val ) FROM ztab INTO lv_min.`,
  `SELECT AVG( val ) FROM ztab INTO lv_avg.`,
  `SELECT COUNT(DISTINCT id) FROM ztab INTO lv_cnt.`,
  `SELECT SUM( val ) MAX( val ) FROM ztab INTO (lv_sum, lv_max).`,
  `SELECT MIN( val ) MAX( val ) FROM ztab INTO (lv_min, lv_max).`,
  `SELECT num MAX( count ) COUNT(*) INTO TABLE lt_tab FROM zfoo.`,
];
statementType(isNotLoopTests, "isSelectLoop → Select (not loop)", Statements.Select);

const isLoopWindowTests = [
  `SELECT ROW_NUMBER( ) OVER( ORDER BY col ) AS rn FROM ztab INTO @wa.`,
  `SELECT RANK( ) OVER( ORDER BY col ) AS rk FROM ztab INTO @wa.`,
  `SELECT SUM( amount ) OVER( PARTITION BY grp ) AS running FROM ztab INTO @wa.`,
  `SELECT ROW_NUMBER( ) OVER( ORDER BY col ) AS rn FROM ztab INTO @wa WHERE id = 1.`,
];
statementVersionOk(isLoopWindowTests.map(abap => ({abap, rel: Release.v757})),
                   "isSelectLoop → SelectLoop (window functions)", Statements.SelectLoop);

const isNotLoopPlainAggTests = [
  `SELECT SUM( amount ) FROM ztab INTO @wa.`,
  `SELECT MAX( val ) MIN( val ) FROM ztab INTO (lv_max, lv_min).`,
];
statementType(isNotLoopPlainAggTests, "isSelectLoop → Select (plain aggregates, no OVER)", Statements.Select);

const clientSpecifiedFail = [
  {abap: `SELECT * FROM ztab CLIENT SPECIFIED INTO @wa.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(clientSpecifiedFail, "SELECT LOOP CLIENT SPECIFIED");
