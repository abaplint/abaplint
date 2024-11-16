import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "PROVIDE FIELDS * \n" +
    "FROM li_temp_join INTO ls_join_temp VALID l_flag BOUNDS datab AND datbi \n" +
    "BETWEEN l_begda AND l_endda.",

  "PROVIDE FIELDS * \n" +
    "FROM li_old INTO ls_old VALID flag1 BOUNDS date_from AND date_to \n" +
    "FIELDS * \n" +
    "FROM li_new INTO ls_new VALID flag2 BOUNDS date_from AND date_to \n" +
    "BETWEEN p_start AND p_end.",

  "provide name from ztab1 name from ztab1 between name1 and name2.",

  "PROVIDE * FROM lt_bar BETWEEN foo AND bar.",
  "PROVIDE * FROM lt_bar BETWEEN foo-begda AND bar-endda.",

  "PROVIDE FIELDS sd FROM lt_sdfsd INTO ls_sdfsd VALID lv_flag BOUNDS begda AND endda BETWEEN <foo>-begda AND <bar>-endda.",

  "PROVIDE field1 field2 FROM sdf BETWEEN bonus AND pn-end.",

  `PROVIDE FIELDS sia_p      FROM lt_t7xa22 INTO ls_t7xa22 VALID lv_flag1 BOUNDS begda AND endda
FIELDS contrib    FROM lt_t7xa23 INTO ls_t7xa23 VALID lv_flag2 BOUNDS begda AND endda
FIELDS amt_perc
       er_contrib FROM lt_t7xa24 INTO ls_t7xa24 VALID lv_flag3 BOUNDS begda AND endda
FIELDS *          FROM lt_9745   INTO ls_9745   VALID lv_flag4 BOUNDS begda AND endda
BETWEEN <p9745>-begda AND <p9745>-endda.`,

  `PROVIDE zfoo FROM p0007
     BETWEEN pn-begda AND pn-endda
     WHERE p0007-zfoo = '1'.`,

  `provide fields objps apact pldat
            from   foo
            into   bar
            valid  val
            bounds start and slut
          where objps = l_seqnr and
                apact = '011'
          between l_begda and l_begda.`,

  `PROVIDE
    KVKZ1 RVKZ1 AVKZ1 RVNUM KVSFR KVGST
    KVBKL KVFBT ZUSKA SONKV SONRV SONAV
    SELKV SELRV MITNR MAXKV KVBAT RVBAT
    PVKZ1 PVBKL PVFBT SONPV SELPV PVBAT
    MAXPV SVA-006 SVA-007 SVA-008       FROM P0013

    AVBAT SVA01 SVA02 SVA03 SVA04 SVA05
    SVA06 SVA07 SVA08                   FROM P0013

    STAT2                               FROM P0000_STAT2

    JUPER                               FROM P0001

    BETWEEN foo AND bar.`,
];

statementType(tests, "PROVIDE", Statements.Provide);