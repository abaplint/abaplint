import {expect} from "chai";
import {SelectAddOrderBy} from "../../src/rules";
import {SelectAddOrderByConf} from "../../src/rules/select_add_order_by";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
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
// FOR ALL ENTRIES, see https://github.com/abaplint/abaplint/issues/3131
  {abap: `SELECT * FROM ztab FOR ALL ENTRIES IN @lt_keys WHERE name = @lt_keys-name INTO TABLE @DATA(lt_res).`, cnt: 1},
  {abap: `SELECT name, value FROM zunknown FOR ALL ENTRIES IN @lt_keys WHERE name = @lt_keys-name INTO TABLE @DATA(lt_res).`, cnt: 0},
  {abap: `SELECT name, value FROM (lv_tab) FOR ALL ENTRIES IN @lt_keys WHERE name = @lt_keys-name INTO TABLE @DATA(lt_res).`, cnt: 0},
];

testRule(tests, SelectAddOrderBy);

const tabl = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZTAB</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>TRANSP</TABCLASS>
    <CLIDEP>X</CLIDEP>
    <DDTEXT>settings</DDTEXT>
    <CONTFLAG>A</CONTFLAG>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD09L>
    <TABNAME>ZTAB</TABNAME>
    <AS4LOCAL>A</AS4LOCAL>
    <TABKAT>0</TABKAT>
    <TABART>APPL0</TABART>
    <BUFALLOW>N</BUFALLOW>
   </DD09L>
   <DD03P_TABLE>
    <DD03P>
     <FIELDNAME>MANDT</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000006</INTLEN>
     <NOTNULL>X</NOTNULL>
     <DATATYPE>CLNT</DATATYPE>
     <LENG>000003</LENG>
     <MASK>  CLNT</MASK>
    </DD03P>
    <DD03P>
     <FIELDNAME>NAME</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000060</INTLEN>
     <NOTNULL>X</NOTNULL>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000030</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
    <DD03P>
     <FIELDNAME>VALUE</FIELDNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000510</INTLEN>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000255</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;

describe("Rule: select_add_order_by, FOR ALL ENTRIES and the primary key, #3131", () => {
  const keys = `
TYPES: BEGIN OF ty_key,
         name TYPE c LENGTH 30,
       END OF ty_key.
DATA lt_keys TYPE STANDARD TABLE OF ty_key WITH EMPTY KEY.
`;

  function run(abap: string, conf?: SelectAddOrderByConf) {
    const reg = new Registry().addFiles([
      new MemoryFile("ztab.tabl.xml", tabl),
      new MemoryFile("zfoo.prog.abap", keys + abap)]).parse();
    const rule = new SelectAddOrderBy();
    if (conf) {
      rule.setConfig(conf);
    }
    return rule.initialize(reg).run(reg.getObject("PROG", "ZFOO")!);
  }

  it("primary key in the field list, client left out, suggest PRIMARY KEY", () => {
    const issues = run(`SELECT name, value FROM ztab FOR ALL ENTRIES IN @lt_keys WHERE name = @lt_keys-name INTO TABLE @DATA(lt_res).`);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.equals("Add ORDER BY PRIMARY KEY");
  });

  it("primary key in the field list, old syntax", () => {
    const issues = run(`DATA lt_res TYPE STANDARD TABLE OF ztab WITH EMPTY KEY.
SELECT name value FROM ztab INTO CORRESPONDING FIELDS OF TABLE lt_res FOR ALL ENTRIES IN lt_keys WHERE name = lt_keys-name.`);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.equals("Add ORDER BY PRIMARY KEY");
  });

  it("primary key not in the field list, no ORDER BY possible, no issue", () => {
    const issues = run(`SELECT value FROM ztab FOR ALL ENTRIES IN @lt_keys WHERE name = @lt_keys-name INTO TABLE @DATA(lt_res).`);
    expect(issues.length).to.equals(0);
  });

  it("ORDER BY PRIMARY KEY given, no issue", () => {
    const issues = run(`SELECT name, value FROM ztab FOR ALL ENTRIES IN @lt_keys WHERE name = @lt_keys-name ORDER BY PRIMARY KEY INTO TABLE @DATA(lt_res).`);
    expect(issues.length).to.equals(0);
  });

  it("skipForAllEntries, no issue", () => {
    const conf = new SelectAddOrderByConf();
    conf.skipForAllEntries = true;
    const issues = run(`SELECT * FROM ztab FOR ALL ENTRIES IN @lt_keys WHERE name = @lt_keys-name INTO TABLE @DATA(lt_res).`, conf);
    expect(issues.length).to.equals(0);
  });

  it("without FOR ALL ENTRIES, plain message", () => {
    const issues = run(`SELECT value FROM ztab WHERE name = 'A' INTO TABLE @DATA(lt_res).`);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.equals("Add ORDER BY");
  });
});
