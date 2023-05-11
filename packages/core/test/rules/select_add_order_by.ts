import {SelectAddOrderBy} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: `sdfdsf`, cnt: 0},
  {abap: `SELECT * from mara INTO table @data(foobar).`, cnt: 1},
  {abap: `select single @abap_true from seoclass where clsname = @name into @data(ext).`, cnt: 0},
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
  {abap: `
  DATA itab TYPE SORTED TABLE OF string WITH UNIQUE KEY table_line.
  SELECT text FROM t100 INTO TABLE @itab.`, cnt: 0},
  {abap: `
  DATA itab2 TYPE SORTED TABLE OF string WITH UNIQUE KEY table_line.
  SELECT text FROM t100 INTO TABLE @itab2.`, cnt: 0},
  {abap: `
DATA: BEGIN OF foo,
        itab2 TYPE SORTED TABLE OF string WITH UNIQUE KEY table_line,
      END OF foo.
SELECT text FROM t100 INTO TABLE @foo-itab2.`, cnt: 0},
// see https://github.com/abaplint/abaplint/issues/2957
  {abap: `SELECT bkpf~bukrs, bkpf~belnr, bkpf~gjahr, bseg~buzei
  FROM bkpf
  INNER JOIN bseg ON bseg~bukrs = bkpf~bukrs
  AND bseg~belnr = bkpf~belnr
  AND bseg~gjahr = bkpf~gjahr
  FOR ALL ENTRIES IN @bkpf_itab
  WHERE bkpf~bukrs = @bkpf_itab-bukrs
    AND bkpf~belnr = @bkpf_itab-belnr
    AND bkpf~gjahr = @bkpf_itab-gjahr
  INTO TABLE @bkpf_itab2.`, cnt: 0},
];

testRule(tests, SelectAddOrderBy);
