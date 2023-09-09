import {MemoryFile} from "../../../src/files/memory_file";
import {expect} from "chai";
import {Renamer} from "../../../src/objects/rename/renamer";
import {Registry} from "../../../src/registry";

describe("Rename Data Element", () => {

  it("DTEL, no references, just the object", () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZBAR</ROLLNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
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
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000001</LENG>
    <OUTPUTLEN>000001</OUTPUTLEN>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry().addFiles([
      new MemoryFile("zbar.dtel.xml", xml),
    ]).parse();

    new Renamer(reg).rename("DTEL", "zbar", "foo");

    expect(reg.getObjectCount()).to.equal(1);
    for (const f of reg.getFiles()) {
      expect(f.getFilename()).to.equal("foo.dtel.xml");
      expect(f.getRaw().includes("<ROLLNAME>FOO</ROLLNAME>")).to.equal(true);
    }
  });

  it("DTEL, no references, just the object, namespaced", () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>/IWBEP/MED_ANNO_NAMESPACE</ROLLNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
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
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000001</LENG>
    <OUTPUTLEN>000001</OUTPUTLEN>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry().addFiles([
      new MemoryFile("#iwbep#med_anno_namespace.dtel.xml", xml),
    ]).parse();

    new Renamer(reg).rename("DTEL", "/iwbep/med_anno_namespace", "zmed_anno_namespace");

    expect(reg.getObjectCount()).to.equal(1);
    for (const f of reg.getFiles()) {
      expect(f.getFilename()).to.equal("zmed_anno_namespace.dtel.xml");
      expect(f.getRaw().includes("<ROLLNAME>ZMED_ANNO_NAMESPACE</ROLLNAME>")).to.equal(true);
    }
  });

  it("DTEL, referenced from PROG", () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZBARBAR</ROLLNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
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
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000001</LENG>
    <OUTPUTLEN>000001</OUTPUTLEN>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const prog = `REPORT zprog_rename_dtel.
CONSTANTS c1 TYPE zbarbar VALUE 'A'. "#EC NOTEXT
CONSTANTS c2 TYPE zbarbar VALUE 'A'. "#EC NOTEXT
DATA bar1 TYPE zbarbar.
DATA bar2 TYPE zbarbar.`;

    const reg = new Registry().addFiles([
      new MemoryFile("zbarbar.dtel.xml", xml),
      new MemoryFile("zprog_rename_dtel.prog.abap", prog),
    ]).parse();

    reg.findIssues(); // hmm, this builds the ddic references

    new Renamer(reg).rename("DTEL", "zbarbar", "foo");

    expect(reg.getObjectCount()).to.equal(2);
    for (const f of reg.getFiles()) {
      if (f.getFilename() === "foo.dtel.xml") {
        expect(f.getRaw().includes("<ROLLNAME>FOO</ROLLNAME>")).to.equal(true);
      } else if (f.getFilename() === "zprog_rename_dtel.prog.abap") {
        expect(f.getRaw()).to.equal(`REPORT zprog_rename_dtel.
CONSTANTS c1 TYPE foo VALUE 'A'. "#EC NOTEXT
CONSTANTS c2 TYPE foo VALUE 'A'. "#EC NOTEXT
DATA bar1 TYPE foo.
DATA bar2 TYPE foo.`);
      } else {
        expect(1).to.equal(f.getFilename(), "unexpected file");
      }
    }
  });

  it("DTEL, referenced from TABL", () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZBAR</ROLLNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
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
    <DDTEXT>Stypemapping</DDTEXT>
    <EXCLASS>4</EXCLASS>
   </DD02V>
   <DD03P_TABLE>
    <DD03P>
     <FIELDNAME>DYNAMIC_STYLE_GUID</FIELDNAME>
     <ROLLNAME>ZBAR</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry().addFiles([
      new MemoryFile("zbar.dtel.xml", xml),
      new MemoryFile("ztabl.tabl.xml", tabl),
    ]).parse();

    reg.findIssues(); // hmm, this builds the ddic references

    new Renamer(reg).rename("DTEL", "zbar", "foo");

    expect(reg.getObjectCount()).to.equal(2);
    for (const f of reg.getFiles()) {
      if (f.getFilename() === "foo.dtel.xml") {
        expect(f.getRaw().includes("<ROLLNAME>FOO</ROLLNAME>")).to.equal(true);
      } else if (f.getFilename() === "ztabl.tabl.xml") {
        expect(f.getRaw()).to.include(`<ROLLNAME>FOO</ROLLNAME>`);
      } else {
        expect(1).to.equal(f.getFilename(), "unexpected file");
      }
    }
  });

  it("DTEL, referenced from TTYP", () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZBAR</ROLLNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
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
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000001</LENG>
    <OUTPUTLEN>000001</OUTPUTLEN>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const ttyp = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TTYP" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD40V>
    <TYPENAME>ZEXCEL_T_STYLE_COLOR_ARGB</TYPENAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <ROWTYPE>ZBAR</ROWTYPE>
    <ROWKIND>E</ROWKIND>
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000008</LENG>
    <ACCESSMODE>T</ACCESSMODE>
    <KEYDEF>D</KEYDEF>
    <KEYKIND>N</KEYKIND>
    <DDTEXT>Table of  RGB colors</DDTEXT>
   </DD40V>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry().addFiles([
      new MemoryFile("zbar.dtel.xml", xml),
      new MemoryFile("zttyp.ttyp.xml", ttyp),
    ]).parse();

    reg.findIssues(); // hmm, this builds the ddic references

    new Renamer(reg).rename("DTEL", "zbar", "foo");

    expect(reg.getObjectCount()).to.equal(2);
    for (const f of reg.getFiles()) {
      if (f.getFilename() === "foo.dtel.xml") {
        expect(f.getRaw().includes("<ROLLNAME>FOO</ROLLNAME>")).to.equal(true);
      } else if (f.getFilename() === "zttyp.ttyp.xml") {
        expect(f.getRaw()).to.include(`<ROWTYPE>FOO</ROWTYPE>`);
      } else {
        expect(1).to.equal(f.getFilename(), "unexpected file");
      }
    }
  });

  it("DTEL, referenced from class in PROG", () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZBARBAR</ROLLNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
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
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000001</LENG>
    <OUTPUTLEN>000001</OUTPUTLEN>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const prog = `REPORT zprog_rename_dtel.
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    CONSTANTS c1 TYPE zbarbar VALUE 'A'. "#EC NOTEXT
    DATA bar1 TYPE zbarbar.
    CONSTANTS c2 TYPE zbarbar VALUE 'A'. "#EC NOTEXT
    DATA bar2 TYPE zbarbar.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
ENDCLASS.`;

    const reg = new Registry().addFiles([
      new MemoryFile("zbarbar.dtel.xml", xml),
      new MemoryFile("zprog_rename_dtel.prog.abap", prog),
    ]).parse();

    reg.findIssues(); // hmm, this builds the ddic references

    new Renamer(reg).rename("DTEL", "zbarbar", "foo");

    expect(reg.getObjectCount()).to.equal(2);
    for (const f of reg.getFiles()) {
      if (f.getFilename() === "foo.dtel.xml") {
        expect(f.getRaw().includes("<ROLLNAME>FOO</ROLLNAME>")).to.equal(true);
      } else if (f.getFilename() === "zprog_rename_dtel.prog.abap") {
        expect(f.getRaw()).to.equal(`REPORT zprog_rename_dtel.
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    CONSTANTS c1 TYPE foo VALUE 'A'. "#EC NOTEXT
    DATA bar1 TYPE foo.
    CONSTANTS c2 TYPE foo VALUE 'A'. "#EC NOTEXT
    DATA bar2 TYPE foo.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
ENDCLASS.`);
      } else {
        expect(1).to.equal(f.getFilename(), "unexpected file");
      }
    }
  });

  it("two DTEL, referenced from INTF", () => {
    const xmlbarbar = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZBARBAR</ROLLNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
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
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000001</LENG>
    <OUTPUTLEN>000001</OUTPUTLEN>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const xmlfoofoo = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZFOOFOO</ROLLNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
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
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000001</LENG>
    <OUTPUTLEN>000001</OUTPUTLEN>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const intf = `INTERFACE zif_excel_sheet_properties PUBLIC.
  DATA hidden TYPE zbarbar.
  DATA show_zeros TYPE zfoofoo.
ENDINTERFACE.`;

    const reg = new Registry().addFiles([
      new MemoryFile("zbarbar.dtel.xml", xmlbarbar),
      new MemoryFile("zfoofoo.dtel.xml", xmlfoofoo),
      new MemoryFile("zif_excel_sheet_properties.intf.abap", intf),
    ]).parse();

    reg.findIssues(); // hmm, this builds the ddic references

    const renamer = new Renamer(reg);
    renamer.rename("DTEL", "zfoofoo", "foo");
    renamer.rename("DTEL", "zbarbar", "bar");

    expect(reg.getObjectCount()).to.equal(3);
    for (const f of reg.getFiles()) {
      if (f.getFilename() === "foo.dtel.xml") {
        expect(f.getRaw().includes("<ROLLNAME>FOO</ROLLNAME>")).to.equal(true);
      } else if (f.getFilename() === "bar.dtel.xml") {
        expect(f.getRaw().includes("<ROLLNAME>BAR</ROLLNAME>")).to.equal(true);
      } else if (f.getFilename() === "zif_excel_sheet_properties.intf.abap") {
        expect(f.getRaw()).to.equal(`INTERFACE zif_excel_sheet_properties PUBLIC.
  DATA hidden TYPE bar.
  DATA show_zeros TYPE foo.
ENDINTERFACE.`);
      } else {
        expect(1).to.equal(f.getFilename(), "unexpected file");
      }
    }
  });

  it("DTEL, referenced in AUTH", () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZBARBAR</ROLLNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
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
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000001</LENG>
    <OUTPUTLEN>000001</OUTPUTLEN>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const auth = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_AUTH" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <AUTHX>
    <FIELDNAME>ZGROUP</FIELDNAME>
    <ROLLNAME>ZBARBAR</ROLLNAME>
   </AUTHX>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry().addFiles([
      new MemoryFile("zbarbar.dtel.xml", xml),
      new MemoryFile("zgroup.auth.xml", auth),
    ]).parse();

    reg.findIssues(); // hmm, this builds the ddic references

    new Renamer(reg).rename("DTEL", "zbarbar", "foo");

    expect(reg.getObjectCount()).to.equal(2);
    for (const f of reg.getFiles()) {
      if (f.getFilename() === "zgroup.auth.xml") {
        expect(f.getRaw().includes("<ROLLNAME>FOO</ROLLNAME>")).to.equal(true);
      } else if (f.getFilename() === "foo.dtel.xml") {
        continue;
      } else {
        expect(1).to.equal(f.getFilename(), "unexpected file");
      }
    }
  });

});