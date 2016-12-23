import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

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
  "SELECT zfoo~bar zbar~foo INTO TABLE rt_data FROM zfoo JOIN zbar ON field1 = field1 FOR ALL ENTRIES IN it_matnr WHERE blah = lv_value.",
  "SELECT COUNT( * ) INTO rv_count FROM foo INNER JOIN bar ON bar~field = foo~field WHERE mat_id IN it_mat_id.",
  "SELECT name INTO TABLE lt_icon FROM icon WHERE name IN s_icon ORDER BY name.",
  "SELECT * UP TO 2 ROWS FROM t005t INTO TABLE lt_test.",
  "SELECT * FROM t006a APPENDING CORRESPONDING FIELDS OF TABLE lt_texts WHERE spras = sy-langu AND msehi = 'ASDF'.",
  "SELECT COUNT(*) INTO dbcount FROM vbak WHERE (where_clause).",
  "SELECT t1~ebeln t1~ebelp FROM eket AS t1 JOIN eket AS t2 ON t1~ebeln = t2~ebeln AND t1~ebelp = t2~ebelp \n" +
    "INTO CORRESPONDING FIELDS OF TABLE rt_data.",
  "SELECT COUNT(*) FROM /bobf/act_conf WHERE name = 'ZFOO'.",
  "SELECT * FROM zfoobar CLIENT SPECIFIED INTO TABLE rt_data WHERE mandt = '111'.",
  "SELECT vbeln INTO CORRESPONDING FIELDS OF lt_table FROM vbak WHERE (where_clause) ORDER BY (orderby_clause).",
  "SELECT SINGLE FOR UPDATE * FROM ZFOOBAR WHERE NAME_ID = lv_name.",
];

statementType(tests, "SELECT", Statements.Select);