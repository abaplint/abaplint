import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {IFile} from "../../src";
import {UnusedDDIC} from "../../src/rules";

async function run(files: IFile[]){
  const reg = new Registry().addFiles(files);
  await reg.parseAsync();
  reg.findIssues();
  const obj = reg.getFirstObject()!;
  const issues = new UnusedDDIC().initialize(reg).run(obj);
  return issues;
}

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

});
