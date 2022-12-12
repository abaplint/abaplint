import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {IFile} from "../../src";
import {UnusedDDIC} from "../../src/rules";

/** returns results for the first file only */
async function run(files: IFile[]){
  const reg = new Registry().addFiles(files);
  await reg.parseAsync();
  reg.findIssues();
  const obj = reg.getFirstObject()!;
  const issues = new UnusedDDIC().initialize(reg).run(obj);
  return issues;
}

const tabl = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZTABL</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>TRANSP</TABCLASS>
    <CLIDEP>X</CLIDEP>
    <DDTEXT>test</DDTEXT>
    <CONTFLAG>A</CONTFLAG>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD09L>
    <TABNAME>ZTABL</TABNAME>
    <AS4LOCAL>A</AS4LOCAL>
    <TABKAT>0</TABKAT>
    <TABART>APPL0</TABART>
    <BUFALLOW>N</BUFALLOW>
   </DD09L>
   <DD03P_TABLE>
    <DD03P>
     <FIELDNAME>MANDT</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ROLLNAME>MANDT</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <NOTNULL>X</NOTNULL>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>RELID</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000004</INTLEN>
     <NOTNULL>X</NOTNULL>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000002</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
    <DD03P>
     <FIELDNAME>ID</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000060</INTLEN>
     <NOTNULL>X</NOTNULL>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000030</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;

describe("Rule: unused_ddic", () => {

  it("no error", async () => {
    const files = [new MemoryFile("zunused_ddic.prog.abap", `WRITE 'moo'.`)];
    const issues = await run(files);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("Unused DOMA", async () => {
    const zunused = `<?xml version="1.0" encoding="utf-8"?>
    <abapGit version="v1.0.0" serializer="LCL_OBJECT_DOMA" serializer_version="v1.0.0">
     <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
      <asx:values>
       <DD01V>
        <DOMNAME>ZUNUSED</DOMNAME>
        <DDLANGUAGE>E</DDLANGUAGE>
        <DATATYPE>CHAR</DATATYPE>
        <LENG>000010</LENG>
        <OUTPUTLEN>000010</OUTPUTLEN>
        <DDTEXT>Testing</DDTEXT>
       </DD01V>
      </asx:values>
     </asx:abap>
    </abapGit>`;

    const files = [new MemoryFile(`zunused.doma.xml`, zunused)];
    const issues = await run(files);
    expect(issues.length).to.equal(1);
  });

  it("Used DOMA", async () => {
    const zused = `<?xml version="1.0" encoding="utf-8"?>
    <abapGit version="v1.0.0" serializer="LCL_OBJECT_DOMA" serializer_version="v1.0.0">
     <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
      <asx:values>
       <DD01V>
        <DOMNAME>ZUSED</DOMNAME>
        <DDLANGUAGE>E</DDLANGUAGE>
        <DATATYPE>CHAR</DATATYPE>
        <LENG>000010</LENG>
        <OUTPUTLEN>000010</OUTPUTLEN>
        <DDTEXT>Testing</DDTEXT>
       </DD01V>
      </asx:values>
     </asx:abap>
    </abapGit>`;

    const zdtel = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZDTEL</ROLLNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <DOMNAME>ZUSED</DOMNAME>
    <HEADLEN>55</HEADLEN>
    <SCRLEN1>10</SCRLEN1>
    <SCRLEN2>20</SCRLEN2>
    <SCRLEN3>40</SCRLEN3>
    <DDTEXT>testing</DDTEXT>
    <REPTEXT>testing</REPTEXT>
    <SCRTEXT_S>testing</SCRTEXT_S>
    <SCRTEXT_M>testing</SCRTEXT_M>
    <SCRTEXT_L>testing</SCRTEXT_L>
    <DTELMASTER>E</DTELMASTER>
    <REFKIND>D</REFKIND>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const files = [new MemoryFile(`zused.doma.xml`, zused), new MemoryFile(`zdtel.dtel.xml`, zdtel)];
    const issues = await run(files);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("Unused DTEL", async () => {
    const zunused = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZUNUSED</ROLLNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <HEADLEN>55</HEADLEN>
    <SCRLEN1>10</SCRLEN1>
    <SCRLEN2>20</SCRLEN2>
    <SCRLEN3>40</SCRLEN3>
    <DTELMASTER>E</DTELMASTER>
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000001</LENG>
    <OUTPUTLEN>000001</OUTPUTLEN>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const files = [new MemoryFile(`zunused.dtel.xml`, zunused)];
    const issues = await run(files);
    expect(issues.length).to.equal(1);
  });

  it("DTEL used in TABL", async () => {
    const dtel = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZUSED</ROLLNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <HEADLEN>55</HEADLEN>
    <SCRLEN1>10</SCRLEN1>
    <SCRLEN2>20</SCRLEN2>
    <SCRLEN3>40</SCRLEN3>
    <DTELMASTER>E</DTELMASTER>
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000001</LENG>
    <OUTPUTLEN>000001</OUTPUTLEN>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const tabl = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZTABL</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>INTTAB</TABCLASS>
    <DDTEXT>structure</DDTEXT>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD03P_TABLE>
    <DD03P>
     <FIELDNAME>FIELD</FIELDNAME>
     <ROLLNAME>ZUSED</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const files = [new MemoryFile(`zused.dtel.xml`, dtel), new MemoryFile(`ztabl.tabl.xml`, tabl)];
    const issues = await run(files);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("DTEL used from PROG", async () => {
    const zunused = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZUSEDPROG</ROLLNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <HEADLEN>55</HEADLEN>
    <SCRLEN1>10</SCRLEN1>
    <SCRLEN2>20</SCRLEN2>
    <SCRLEN3>40</SCRLEN3>
    <DTELMASTER>E</DTELMASTER>
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000001</LENG>
    <OUTPUTLEN>000001</OUTPUTLEN>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const prog = `DATA bar TYPE zusedprog.`;

    const files = [new MemoryFile(`zusedprog.dtel.xml`, zunused), new MemoryFile(`zprog.prog.abap`, prog)];
    const issues = await run(files);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("DTEL used from local method definition", async () => {
    const zunused = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZUSEDPROG</ROLLNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <HEADLEN>55</HEADLEN>
    <SCRLEN1>10</SCRLEN1>
    <SCRLEN2>20</SCRLEN2>
    <SCRLEN3>40</SCRLEN3>
    <DTELMASTER>E</DTELMASTER>
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000001</LENG>
    <OUTPUTLEN>000001</OUTPUTLEN>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const prog = `CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS bar
      RETURNING VALUE(ref) TYPE zusedprog.
ENDCLASS.

CLASS lcl_bar IMPLEMENTATION.
  METHOD bar.
  ENDMETHOD.
ENDCLASS.`;

    const files = [new MemoryFile(`zusedprog.dtel.xml`, zunused), new MemoryFile(`zprog.prog.abap`, prog)];
    const issues = await run(files);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("DTEL used from global method definition", async () => {
    const zunused = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZUSEDPROG</ROLLNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <HEADLEN>55</HEADLEN>
    <SCRLEN1>10</SCRLEN1>
    <SCRLEN2>20</SCRLEN2>
    <SCRLEN3>40</SCRLEN3>
    <DTELMASTER>E</DTELMASTER>
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000001</LENG>
    <OUTPUTLEN>000001</OUTPUTLEN>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const prog = `CLASS zcl_bar DEFINITION PUBLIC.
  PUBLIC SECTION.
    METHODS bar
      RETURNING VALUE(ref) TYPE zusedprog.
ENDCLASS.

CLASS zcl_bar IMPLEMENTATION.
  METHOD bar.
  ENDMETHOD.
ENDCLASS.`;

    const files = [new MemoryFile(`zusedprog.dtel.xml`, zunused), new MemoryFile(`zcl_bar.clas.abap`, prog)];
    const issues = await run(files);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("TABL referenced via field", async () => {
    const dtel = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZUSED</ROLLNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <HEADLEN>55</HEADLEN>
    <SCRLEN1>10</SCRLEN1>
    <SCRLEN2>20</SCRLEN2>
    <SCRLEN3>40</SCRLEN3>
    <DTELMASTER>E</DTELMASTER>
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000001</LENG>
    <OUTPUTLEN>000001</OUTPUTLEN>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const tabl = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZTABL</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>INTTAB</TABCLASS>
    <DDTEXT>structure</DDTEXT>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD03P_TABLE>
    <DD03P>
     <FIELDNAME>FIELD</FIELDNAME>
     <ROLLNAME>ZUSED</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const abap = `DATA bar TYPE ztabl-field.`;

    const files = [
      new MemoryFile(`ztabl.tabl.xml`, tabl),
      new MemoryFile(`zprogabc.prog.abap`, abap),
      new MemoryFile(`zused.dtel.xml`, dtel),
    ];
    const issues = await run(files);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("TABL referenced via EXPORT", async () => {
    const abap = `FIELD-SYMBOLS <bar> TYPE any.
EXPORT foo = <bar>
  TO DATABASE ztabl(aa)
  ID 'HELLO'.`;

    const files = [
      new MemoryFile(`ztabl.tabl.xml`, tabl),
      new MemoryFile(`zprogabc.prog.abap`, abap),
    ];
    const issues = await run(files);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("TABL referenced via SELECT", async () => {
    const abap = `SELECT SINGLE * FROM ztabl INTO @DATA(ls_sdfsd).`;

    const files = [
      new MemoryFile(`ztabl.tabl.xml`, tabl),
      new MemoryFile(`zprogabc.prog.abap`, abap),
    ];
    const issues = await run(files);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ZLINT_TEST2 references ZLINT_TEST1 via foreign key", async () => {
    const zlint_test1 = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZLINT_TEST1</TABNAME>
    <TABCLASS>TRANSP</TABCLASS>
    <CLIDEP>X</CLIDEP>
    <MASTERLANG>E</MASTERLANG>
    <CONTFLAG>A</CONTFLAG>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD09L>
    <TABNAME>ZLINT_TEST1</TABNAME>
    <AS4LOCAL>A</AS4LOCAL>
    <TABKAT>0</TABKAT>
    <TABART>APPL0</TABART>
    <BUFALLOW>N</BUFALLOW>
   </DD09L>
   <DD03P_TABLE>
    <DD03P>
     <FIELDNAME>CLIENT</FIELDNAME>
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
     <FIELDNAME>BUKRS</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ROLLNAME>BUKRS</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <NOTNULL>X</NOTNULL>
     <SHLPORIGIN>D</SHLPORIGIN>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
   </DD03P_TABLE>
   <I18N_LANGS>
    <LANGU>E</LANGU>
   </I18N_LANGS>
   <DD02_TEXTS>
    <item>
     <DDLANGUAGE>E</DDLANGUAGE>
     <DDTEXT>AbapLint test table 1</DDTEXT>
    </item>
   </DD02_TEXTS>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const zlint_test2 = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZLINT_TEST2</TABNAME>
    <TABCLASS>TRANSP</TABCLASS>
    <CLIDEP>X</CLIDEP>
    <MASTERLANG>E</MASTERLANG>
    <CONTFLAG>A</CONTFLAG>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD09L>
    <TABNAME>ZLINT_TEST2</TABNAME>
    <AS4LOCAL>A</AS4LOCAL>
    <TABKAT>0</TABKAT>
    <TABART>APPL0</TABART>
    <BUFALLOW>N</BUFALLOW>
   </DD09L>
   <DD03P_TABLE>
    <DD03P>
     <FIELDNAME>CLIENT</FIELDNAME>
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
     <FIELDNAME>BUKRS</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ROLLNAME>BUKRS</ROLLNAME>
     <CHECKTABLE>ZLINT_TEST1</CHECKTABLE>
     <ADMINFIELD>0</ADMINFIELD>
     <NOTNULL>X</NOTNULL>
     <SHLPORIGIN>P</SHLPORIGIN>
     <SHLPNAME>C_T001</SHLPNAME>
     <SHLPFIELD>BUKRS</SHLPFIELD>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
   </DD03P_TABLE>
   <DD05M_TABLE>
    <DD05M>
     <FIELDNAME>BUKRS</FIELDNAME>
     <FORTABLE>ZLINT_TEST2</FORTABLE>
     <FORKEY>CLIENT</FORKEY>
     <CHECKTABLE>ZLINT_TEST1</CHECKTABLE>
     <CHECKFIELD>CLIENT</CHECKFIELD>
     <PRIMPOS>0001</PRIMPOS>
     <DATATYPE>CLNT</DATATYPE>
    </DD05M>
    <DD05M>
     <FIELDNAME>BUKRS</FIELDNAME>
     <FORTABLE>ZLINT_TEST2</FORTABLE>
     <FORKEY>BUKRS</FORKEY>
     <CHECKTABLE>ZLINT_TEST1</CHECKTABLE>
     <CHECKFIELD>BUKRS</CHECKFIELD>
     <PRIMPOS>0002</PRIMPOS>
     <DOMNAME>BUKRS</DOMNAME>
     <DATATYPE>CHAR</DATATYPE>
    </DD05M>
   </DD05M_TABLE>
   <DD08V_TABLE>
    <DD08V>
     <FIELDNAME>BUKRS</FIELDNAME>
     <CHECKTABLE>ZLINT_TEST1</CHECKTABLE>
     <CHECKFLAG>X</CHECKFLAG>
    </DD08V>
   </DD08V_TABLE>
   <I18N_LANGS>
    <LANGU>E</LANGU>
   </I18N_LANGS>
   <DD02_TEXTS>
    <item>
     <DDLANGUAGE>E</DDLANGUAGE>
     <DDTEXT>AbapLint test table 2</DDTEXT>
    </item>
   </DD02_TEXTS>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const files = [
      new MemoryFile(`zlint_test1.tabl.xml`, zlint_test1),
      new MemoryFile(`zlint_test2.tabl.xml`, zlint_test2),
    ];
    const issues = await run(files);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("TABL used in ENQU", async () => {
    const enqu = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_ENQU" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD25V>
    <VIEWNAME>EZABAPGIT_UNIT_T</VIEWNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <AGGTYPE>E</AGGTYPE>
    <ROOTTAB>ZABAPGIT_UNIT_TE</ROOTTAB>
    <DDTEXT>Test</DDTEXT>
   </DD25V>
   <DD26E_TABLE>
    <DD26E>
     <VIEWNAME>EZABAPGIT_UNIT_T</VIEWNAME>
     <TABNAME>ZABAPGIT_UNIT_TE</TABNAME>
     <TABPOS>0001</TABPOS>
     <FORTABNAME>ZABAPGIT_UNIT_TE</FORTABNAME>
     <ENQMODE>E</ENQMODE>
    </DD26E>
   </DD26E_TABLE>
   <DD27P_TABLE>
    <DD27P>
     <VIEWNAME>EZABAPGIT_UNIT_T</VIEWNAME>
     <OBJPOS>0001</OBJPOS>
     <VIEWFIELD>MANDT</VIEWFIELD>
     <TABNAME>ZABAPGIT_UNIT_TE</TABNAME>
     <FIELDNAME>MANDT</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ENQMODE>E</ENQMODE>
    </DD27P>
    <DD27P>
     <VIEWNAME>EZABAPGIT_UNIT_T</VIEWNAME>
     <OBJPOS>0002</OBJPOS>
     <VIEWFIELD>BNAME</VIEWFIELD>
     <TABNAME>ZABAPGIT_UNIT_TE</TABNAME>
     <FIELDNAME>BNAME</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ENQMODE>E</ENQMODE>
     <MEMORYID>XUS</MEMORYID>
    </DD27P>
   </DD27P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const tabl = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZABAPGIT_UNIT_TE</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>TRANSP</TABCLASS>
    <CLIDEP>X</CLIDEP>
    <DDTEXT>Test</DDTEXT>
    <CONTFLAG>A</CONTFLAG>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD09L>
    <TABNAME>ZABAPGIT_UNIT_TE</TABNAME>
    <AS4LOCAL>A</AS4LOCAL>
    <TABKAT>0</TABKAT>
    <TABART>APPL0</TABART>
    <BUFALLOW>N</BUFALLOW>
   </DD09L>
   <DD03P_TABLE>
    <DD03P>
     <FIELDNAME>MANDT</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ROLLNAME>MANDT</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <NOTNULL>X</NOTNULL>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>BNAME</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ROLLNAME>XUBNAME</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <NOTNULL>X</NOTNULL>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>FIELD</FIELDNAME>
     <ROLLNAME>XUBNAME</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const files = [
      new MemoryFile(`zabapgit_unit_te.tabl.xml`, tabl),
      new MemoryFile(`ezabapgit_unit_t.enqu.xml`, enqu),
    ];
    const issues = await run(files);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

});
