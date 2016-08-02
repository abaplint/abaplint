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
  "SELECT name INTO TABLE lt_icon FROM icon WHERE name IN s_icon ORDER BY name.",
  "SELECT * UP TO 2 ROWS FROM t005t INTO TABLE lt_test.",
];

statementType(tests, "SELECT", Statements.Select);