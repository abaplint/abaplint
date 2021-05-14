import {SelectAddOrderBy} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: `sdfdsf`, cnt: 0},
  {abap: `SELECT * from mara INTO table @data(foobar).`, cnt: 1},
  {abap: `SELECT * from mara INTO table @data(foobar) order by primary key.`, cnt: 0},
  {abap: `SELECT COUNT(*) FROM tcdrp WHERE object = mv_object.`, cnt: 0},
  {abap: `SELECT COUNT( * ) FROM  dm40l
  WHERE  dmoid     = mv_data_model
  AND    as4local  = mv_activation_state.`, cnt: 0},
  {abap: `SELECT MAX( dokversion )
  INTO ls_header-tdversion
  FROM dokhl
  WHERE id = c_lxe_text_type
  AND   object = mv_text_object
  AND   langu = ls_udmo_long_text-language.`, cnt: 0},
  /*
  {abap: `
  DATA itab TYPE HASHED TABLE OF string.
  SELECT text FROM t100 INTO TABLE @itab.`, cnt: 0},
  {abap: `
  DATA itab2 TYPE SORTED TABLE OF string.
  SELECT text FROM t100 INTO TABLE @itab2.`, cnt: 0},
  */
];

testRule(tests, SelectAddOrderBy);
