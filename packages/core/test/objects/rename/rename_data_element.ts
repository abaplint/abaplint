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

  it("DTEL, referenced from PROG", () => {
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

    const prog = `REPORT zprog_rename_dtel.
DATA bar1 TYPE zbar.
DATA bar2 TYPE zbar.`;

    const reg = new Registry().addFiles([
      new MemoryFile("zbar.dtel.xml", xml),
      new MemoryFile("zprog_rename_dtel.prog.abap", prog),
    ]).parse();

    reg.findIssues(); // hmm, this builds the ddic references

    new Renamer(reg).rename("DTEL", "zbar", "foo");

    expect(reg.getObjectCount()).to.equal(2);
    for (const f of reg.getFiles()) {
      if (f.getFilename() === "foo.dtel.xml") {
        expect(f.getRaw().includes("<ROLLNAME>FOO</ROLLNAME>")).to.equal(true);
      } else if (f.getFilename() === "zprog_rename_dtel.prog.abap") {
        expect(f.getRaw()).to.equal(`REPORT zprog_rename_dtel.
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

});