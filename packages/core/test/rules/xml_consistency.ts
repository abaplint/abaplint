import {Registry} from "../../src/registry";
import {XMLConsistency} from "../../src/rules";
import {expect} from "chai";
import {IRegistry} from "../../src/_iregistry";
import {Issue} from "../../src/issue";
import {MemoryFile} from "../../src/files/memory_file";

async function run(reg: IRegistry): Promise<Issue[]> {
  await reg.parseAsync();
  const rule = new XMLConsistency();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_CLAS" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <VSEOCLASS>
    <CLSNAME>ZCL_KLAUS</CLSNAME>
    <LANGU>E</LANGU>
    <DESCRIPT>Description</DESCRIPT>
    <STATE>1</STATE>
    <CLSCCINCL>X</CLSCCINCL>
    <FIXPT>X</FIXPT>
    <UNICODE>X</UNICODE>
   </VSEOCLASS>
  </asx:values>
 </asx:abap>
</abapGit>`;

describe("rule, xml_consistency, error", async () => {

  it("test, name mismatch", async () => {
    const reg = new Registry().addFile(new MemoryFile("zcl_lars.clas.xml", xml));
    const issues = await run(reg);
    expect(issues.length).to.equals(1);
  });

});

describe("rule, xml_consistency, okay", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
  <abapGit version="v1.0.0" serializer="LCL_OBJECT_CLAS" serializer_version="v1.0.0">
   <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
    <asx:values>
     <VSEOCLASS>
      <CLSNAME>ZCL_LARS</CLSNAME>
      <LANGU>E</LANGU>
      <DESCRIPT>Description</DESCRIPT>
      <STATE>1</STATE>
      <CLSCCINCL>X</CLSCCINCL>
      <FIXPT>X</FIXPT>
      <UNICODE>X</UNICODE>
     </VSEOCLASS>
    </asx:values>
   </asx:abap>
  </abapGit>`;

  const abap = `
    CLASS ZCL_LARS DEFINITION PUBLIC CREATE PUBLIC .
    ENDCLASS.
    CLASS ZCL_LARS IMPLEMENTATION.
    ENDCLASS.`;

  it("test", async () => {
    const reg = new Registry().addFile(new MemoryFile("zcl_lars.clas.xml", xml)).addFile(new MemoryFile("zcl_lars.clas.abap", abap));
    const issues = await run(reg);
    expect(issues.length).to.equals(0);
  });
});

describe("rule, xml_consistency, mismatch xml and abap", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
  <abapGit version="v1.0.0" serializer="LCL_OBJECT_CLAS" serializer_version="v1.0.0">
   <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
    <asx:values>
     <VSEOCLASS>
      <CLSNAME>ZCL_LARS</CLSNAME>
      <LANGU>E</LANGU>
      <DESCRIPT>Description</DESCRIPT>
      <STATE>1</STATE>
      <CLSCCINCL>X</CLSCCINCL>
      <FIXPT>X</FIXPT>
      <UNICODE>X</UNICODE>
     </VSEOCLASS>
    </asx:values>
   </asx:abap>
  </abapGit>`;

  const abap = `
    CLASS cl_lars DEFINITION PUBLIC CREATE PUBLIC .
    ENDCLASS.
    CLASS cl_lars IMPLEMENTATION.
    ENDCLASS.`;

  it("test", async () => {
    const reg = new Registry().addFile(new MemoryFile("zcl_lars.clas.xml", xml)).addFile(new MemoryFile("zcl_lars.clas.abap", abap));
    const issues = await run(reg);
    expect(issues.length).to.equals(1);
  });
});

describe("description too long", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
  <abapGit version="v1.0.0" serializer="LCL_OBJECT_CLAS" serializer_version="v1.0.0">
   <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
    <asx:values>
     <VSEOCLASS>
      <CLSNAME>ZCL_LARS</CLSNAME>
      <LANGU>E</LANGU>
      <DESCRIPT>abapGit - ENHO - Enhancement Implementation of Function Groups</DESCRIPT>
      <STATE>1</STATE>
      <CLSCCINCL>X</CLSCCINCL>
      <FIXPT>X</FIXPT>
      <UNICODE>X</UNICODE>
     </VSEOCLASS>
    </asx:values>
   </asx:abap>
  </abapGit>`;

  const abap = `
    CLASS zcl_lars DEFINITION PUBLIC CREATE PUBLIC .
    ENDCLASS.
    CLASS zcl_lars IMPLEMENTATION.
    ENDCLASS.`;

  it("test", async () => {
    const reg = new Registry().addFile(new MemoryFile("zcl_lars.clas.xml", xml)).addFile(new MemoryFile("zcl_lars.clas.abap", abap));
    const issues = await run(reg);
    expect(issues.length).to.equals(1);
  });
});

describe("rule, xml_consistency, INTF mismatch xml and abap", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_INTF" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <VSEOINTERF>
    <CLSNAME>ZIF_ABAPGIT_XML_INPUT</CLSNAME>
    <LANGU>E</LANGU>
    <DESCRIPT>Interface for XML INPUT</DESCRIPT>
    <EXPOSURE>2</EXPOSURE>
    <STATE>1</STATE>
    <UNICODE>X</UNICODE>
   </VSEOINTERF>
  </asx:values>
 </asx:abap>
</abapGit>`;

  it("test", async () => {
    const abap = `
INTERFACE if_abapgit_xml_input PUBLIC.
ENDINTERFACE.`;

    const reg = new Registry().addFile(new MemoryFile("zif_abapgit_xml_input.intf.xml", xml)).addFile(new MemoryFile("zif_abapgit_xml_input.intf.abap", abap));
    const issues = await run(reg);
    expect(issues.length).to.equals(1);
  });

  it("parsing/syntax error should not trigger xml consistency", async () => {
    const abap = `
INTERFACE if_abapgit_xml_input PUBLIC.
  INTERFACES zif_not_found.
ENDINTERFACE.`;

    const reg = new Registry().addFile(
      new MemoryFile("zif_abapgit_xml_input.intf.xml", xml)).addFile(
      new MemoryFile("#foo#zif.intf.abap", abap));
    const issues = await run(reg);
    expect(issues.length).to.equals(0);
  });
});

describe("rule, xml_consistency, INTF ok, with namespace", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_INTF" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <VSEOINTERF>
    <CLSNAME>/FOO/ZIF</CLSNAME>
    <LANGU>E</LANGU>
    <DESCRIPT>Interface for XML INPUT</DESCRIPT>
    <EXPOSURE>2</EXPOSURE>
    <STATE>1</STATE>
    <UNICODE>X</UNICODE>
   </VSEOINTERF>
  </asx:values>
 </asx:abap>
</abapGit>`;

  it("test", async () => {
    const abap = `
    INTERFACE /foo/zif PUBLIC.
    ENDINTERFACE.`;

    const reg = new Registry().addFile(new MemoryFile("#foo#zif.intf.xml", xml)).addFile(new MemoryFile("#foo#zif.intf.abap", abap));
    const issues = await run(reg);
    expect(issues.length).to.equals(0);
  });
});

describe("xml consistency", () => {
  it("parser error", async () => {
    const reg = new Registry().addFile(new MemoryFile("zcl_lars.msag.xml", `parser error`));
    const issues = await run(reg);
    expect(issues.length).to.equals(1);
  });

  it("parser error, DTEL", async () => {
    const reg = new Registry().addFile(new MemoryFile("zdtel.dtel.xml", `parser error`));
    const issues = await run(reg);
    expect(issues.length).to.equals(1);
  });

  it("parser error, xml ok, abap not", async () => {
    const reg = new Registry().addFile(new MemoryFile("zcl_klaus.clas.xml", xml)).addFile(new MemoryFile("zcl_klaus.clas.abap", "parser error"));
    const issues = await run(reg);
    expect(issues.length).to.equals(0);
  });

  it("not ok ampersand", async () => {
    const reg = new Registry().addFile(new MemoryFile("zcl_klaus.devc.xml", "<foo>sdfsd & sfds</foo>"));
    const issues = await run(reg);
    expect(issues.length).to.equals(1);
  });
});

async function runDtel(xml: string): Promise<Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zdtel.dtel.xml", xml));
  return run(reg);
}

describe("rule, xml_consistency, DTEL label lengths", () => {

  it("no issues when all texts are within limits", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZDTEL</ROLLNAME>
    <HEADLEN>10</HEADLEN>
    <SCRLEN1>05</SCRLEN1>
    <SCRLEN2>10</SCRLEN2>
    <SCRLEN3>20</SCRLEN3>
    <DDTEXT>Short description</DDTEXT>
    <REPTEXT>Heading</REPTEXT>
    <SCRTEXT_S>Short</SCRTEXT_S>
    <SCRTEXT_M>Medium txt</SCRTEXT_M>
    <SCRTEXT_L>Long label text here</SCRTEXT_L>
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000010</LENG>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const issues = await runDtel(xml);
    expect(issues.length).to.equal(0);
  });

  it("DDTEXT exceeds 60 characters", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZDTEL</ROLLNAME>
    <DDTEXT>This description is way too long and definitely exceeds sixty characters total</DDTEXT>
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000010</LENG>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const issues = await runDtel(xml);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.include("DDTEXT");
  });

  it("DDTEXT exactly 60 characters is ok", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZDTEL</ROLLNAME>
    <DDTEXT>123456789012345678901234567890123456789012345678901234567890</DDTEXT>
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000010</LENG>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const issues = await runDtel(xml);
    expect(issues.length).to.equal(0);
  });

  it("SCRTEXT_S exceeds SCRLEN1", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZDTEL</ROLLNAME>
    <SCRLEN1>05</SCRLEN1>
    <SCRTEXT_S>TooLong</SCRTEXT_S>
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000010</LENG>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const issues = await runDtel(xml);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.include("SCRTEXT_S");
  });

  it("SCRTEXT_M exceeds SCRLEN2", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZDTEL</ROLLNAME>
    <SCRLEN2>10</SCRLEN2>
    <SCRTEXT_M>Medium text too long</SCRTEXT_M>
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000010</LENG>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const issues = await runDtel(xml);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.include("SCRTEXT_M");
  });

  it("SCRTEXT_L exceeds SCRLEN3", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZDTEL</ROLLNAME>
    <SCRLEN3>10</SCRLEN3>
    <SCRTEXT_L>Long label text exceeding limit</SCRTEXT_L>
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000010</LENG>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const issues = await runDtel(xml);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.include("SCRTEXT_L");
  });

  it("REPTEXT exceeds HEADLEN", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZDTEL</ROLLNAME>
    <HEADLEN>05</HEADLEN>
    <REPTEXT>Heading too long</REPTEXT>
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000010</LENG>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const issues = await runDtel(xml);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.include("REPTEXT");
  });

  it("multiple violations reported", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZDTEL</ROLLNAME>
    <HEADLEN>03</HEADLEN>
    <SCRLEN1>03</SCRLEN1>
    <REPTEXT>Heading too long</REPTEXT>
    <SCRTEXT_S>Short text too long</SCRTEXT_S>
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000010</LENG>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const issues = await runDtel(xml);
    expect(issues.length).to.equal(2);
  });

  it("no issue when label length fields are absent", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZDTEL</ROLLNAME>
    <SCRTEXT_S>Short</SCRTEXT_S>
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000010</LENG>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const issues = await runDtel(xml);
    expect(issues.length).to.equal(0);
  });


  describe("Translation label lengths", () => {

    it("translation SCRTEXT_M exceeds SCRLEN2", async () => {
      const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZDTEL</ROLLNAME>
    <SCRLEN1>10</SCRLEN1>
    <SCRLEN2>10</SCRLEN2>
    <SCRLEN3>40</SCRLEN3>
    <HEADLEN>55</HEADLEN>
    <DDTEXT>Text</DDTEXT>
    <SCRTEXT_S>Short</SCRTEXT_S>
    <SCRTEXT_M>Medium</SCRTEXT_M>
    <SCRTEXT_L>Long</SCRTEXT_L>
   </DD04V>
   <DD04_TEXTS>
    <item>
     <DDLANGUAGE>F</DDLANGUAGE>
     <DDTEXT>Text</DDTEXT>
     <SCRTEXT_S>Short</SCRTEXT_S>
     <SCRTEXT_M>medium text too long</SCRTEXT_M>
     <SCRTEXT_L>Long</SCRTEXT_L>
    </item>
   </DD04_TEXTS>
  </asx:values>
 </asx:abap>
</abapGit>`;
      const issues = await runDtel(xml);
      expect(issues.length).to.equal(1);
      expect(issues[0].getMessage()).to.include("[F]");
      expect(issues[0].getMessage()).to.include("SCRTEXT_M");
    });

    it("translation SCRTEXT_S exceeds SCRLEN1", async () => {
      const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZDTEL</ROLLNAME>
    <SCRLEN1>05</SCRLEN1>
    <SCRLEN2>20</SCRLEN2>
    <SCRLEN3>40</SCRLEN3>
    <HEADLEN>55</HEADLEN>
    <DDTEXT>Text</DDTEXT>
    <SCRTEXT_S>Short</SCRTEXT_S>
    <SCRTEXT_M>Medium</SCRTEXT_M>
    <SCRTEXT_L>Long</SCRTEXT_L>
   </DD04V>
   <DD04_TEXTS>
    <item>
     <DDLANGUAGE>I</DDLANGUAGE>
     <DDTEXT>Text</DDTEXT>
     <SCRTEXT_S>toolong</SCRTEXT_S>
     <SCRTEXT_M>Medium</SCRTEXT_M>
     <SCRTEXT_L>Long</SCRTEXT_L>
    </item>
   </DD04_TEXTS>
  </asx:values>
 </asx:abap>
</abapGit>`;
      const issues = await runDtel(xml);
      expect(issues.length).to.equal(1);
      expect(issues[0].getMessage()).to.include("[I]");
      expect(issues[0].getMessage()).to.include("SCRTEXT_S");
    });

    it("multiple translations, multiple violations", async () => {
      const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZDTEL</ROLLNAME>
    <SCRLEN1>05</SCRLEN1>
    <SCRLEN2>10</SCRLEN2>
    <SCRLEN3>40</SCRLEN3>
    <HEADLEN>55</HEADLEN>
    <DDTEXT>Text</DDTEXT>
   </DD04V>
   <DD04_TEXTS>
    <item>
     <DDLANGUAGE>F</DDLANGUAGE>
     <SCRTEXT_M>medium text too long</SCRTEXT_M>
    </item>
    <item>
     <DDLANGUAGE>I</DDLANGUAGE>
     <SCRTEXT_S>toolong</SCRTEXT_S>
    </item>
   </DD04_TEXTS>
  </asx:values>
 </asx:abap>
</abapGit>`;
      const issues = await runDtel(xml);
      expect(issues.length).to.equal(2);
    });

    it("translations within limits have no issues", async () => {
      const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZDTEL</ROLLNAME>
    <SCRLEN1>10</SCRLEN1>
    <SCRLEN2>20</SCRLEN2>
    <SCRLEN3>40</SCRLEN3>
    <HEADLEN>55</HEADLEN>
    <DDTEXT>Text</DDTEXT>
   </DD04V>
   <DD04_TEXTS>
    <item>
     <DDLANGUAGE>D</DDLANGUAGE>
     <SCRTEXT_S>Short val</SCRTEXT_S>
     <SCRTEXT_M>Medium text value</SCRTEXT_M>
     <SCRTEXT_L>Long label text value</SCRTEXT_L>
    </item>
   </DD04_TEXTS>
  </asx:values>
 </asx:abap>
</abapGit>`;
      const issues = await runDtel(xml);
      expect(issues.length).to.equal(0);
    });

  });


});

async function runTran(xml: string): Promise<Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("ztran.tran.xml", xml));
  return run(reg);
}

describe("rule, xml_consistency, TRAN description length", () => {

  it("no issue when description is within 36 characters", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TRAN" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <TSTC>
    <TCODE>ZTRAN</TCODE>
    <PGMNA>ZTRAN</PGMNA>
   </TSTC>
   <TSTCT>
    <SPRSL>E</SPRSL>
    <TCODE>ZTRAN</TCODE>
    <TTEXT>Short description</TTEXT>
   </TSTCT>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const issues = await runTran(xml);
    expect(issues.length).to.equal(0);
  });

  it("description exactly 36 characters is ok", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TRAN" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <TSTC>
    <TCODE>ZTRAN</TCODE>
    <PGMNA>ZTRAN</PGMNA>
   </TSTC>
   <TSTCT>
    <SPRSL>E</SPRSL>
    <TCODE>ZTRAN</TCODE>
    <TTEXT>123456789012345678901234567890123456</TTEXT>
   </TSTCT>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const issues = await runTran(xml);
    expect(issues.length).to.equal(0);
  });

  it("description exceeds 36 characters", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TRAN" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <TSTC>
    <TCODE>ZTRAN</TCODE>
    <PGMNA>ZTRAN</PGMNA>
   </TSTC>
   <TSTCT>
    <SPRSL>E</SPRSL>
    <TCODE>ZTRAN</TCODE>
    <TTEXT>This description is way too long and exceeds 36 chars</TTEXT>
   </TSTCT>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const issues = await runTran(xml);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.include("36");
  });

  it("translation description exceeds 36 characters", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TRAN" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <TSTC>
    <TCODE>ZTRAN</TCODE>
    <PGMNA>ZTRAN</PGMNA>
   </TSTC>
   <TSTCT>
    <SPRSL>E</SPRSL>
    <TCODE>ZTRAN</TCODE>
    <TTEXT>Short description</TTEXT>
   </TSTCT>
   <I18N_TPOOL>
    <TSTCT>
     <SPRSL>F</SPRSL>
     <TTEXT>Extra long translation text that exceeds 36 characters</TTEXT>
    </TSTCT>
   </I18N_TPOOL>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const issues = await runTran(xml);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.include("[F]");
    expect(issues[0].getMessage()).to.include("36");
  });

  it("multiple translation descriptions exceed 36 characters", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TRAN" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <TSTC>
    <TCODE>ZTRAN</TCODE>
    <PGMNA>ZTRAN</PGMNA>
   </TSTC>
   <TSTCT>
    <SPRSL>E</SPRSL>
    <TCODE>ZTRAN</TCODE>
    <TTEXT>Short description</TTEXT>
   </TSTCT>
   <I18N_TPOOL>
    <TSTCT>
     <SPRSL>F</SPRSL>
     <TTEXT>Extra long translation text that exceeds 36 characters</TTEXT>
    </TSTCT>
    <TSTCT>
     <SPRSL>D</SPRSL>
     <TTEXT>Sehr lange Beschreibung die 36 Zeichen überschreitet</TTEXT>
    </TSTCT>
   </I18N_TPOOL>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const issues = await runTran(xml);
    expect(issues.length).to.equal(2);
  });

  it("translations within 36 characters have no issues", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TRAN" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <TSTC>
    <TCODE>ZTRAN</TCODE>
    <PGMNA>ZTRAN</PGMNA>
   </TSTC>
   <TSTCT>
    <SPRSL>E</SPRSL>
    <TCODE>ZTRAN</TCODE>
    <TTEXT>Short description</TTEXT>
   </TSTCT>
   <I18N_TPOOL>
    <TSTCT>
     <SPRSL>D</SPRSL>
     <TTEXT>Kurze Beschreibung</TTEXT>
    </TSTCT>
   </I18N_TPOOL>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const issues = await runTran(xml);
    expect(issues.length).to.equal(0);
  });

});

async function runMsag(xml: string): Promise<Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zmsag.msag.xml", xml));
  return run(reg);
}

describe("rule, xml_consistency, MSAG message text length", () => {

  it("no issue when message text is within 73 characters", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_MSAG" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <T100A>
    <ARBGB>ZMSAG</ARBGB>
    <MASTERLANG>E</MASTERLANG>
    <STEXT>Message class</STEXT>
   </T100A>
   <T100>
    <T100>
     <SPRSL>E</SPRSL>
     <ARBGB>ZMSAG</ARBGB>
     <MSGNR>001</MSGNR>
     <TEXT>This is a short message</TEXT>
    </T100>
   </T100>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const issues = await runMsag(xml);
    expect(issues.length).to.equal(0);
  });

  it("message text exactly 73 characters is ok", async () => {
    const text73 = "1234567890123456789012345678901234567890123456789012345678901234567890123";
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_MSAG" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <T100A>
    <ARBGB>ZMSAG</ARBGB>
    <MASTERLANG>E</MASTERLANG>
    <STEXT>Message class</STEXT>
   </T100A>
   <T100>
    <T100>
     <SPRSL>E</SPRSL>
     <ARBGB>ZMSAG</ARBGB>
     <MSGNR>001</MSGNR>
     <TEXT>${text73}</TEXT>
    </T100>
   </T100>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const issues = await runMsag(xml);
    expect(issues.length).to.equal(0);
  });

  it("message text exceeds 73 characters", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_MSAG" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <T100A>
    <ARBGB>ZMSAG</ARBGB>
    <MASTERLANG>E</MASTERLANG>
    <STEXT>Message class</STEXT>
   </T100A>
   <T100>
    <T100>
     <SPRSL>E</SPRSL>
     <ARBGB>ZMSAG</ARBGB>
     <MSGNR>001</MSGNR>
     <TEXT>This message text is way too long and definitively exceeds the seventy-three char limit</TEXT>
    </T100>
   </T100>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const issues = await runMsag(xml);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.include("73");
  });

  it("multiple messages, one exceeds 73 characters", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_MSAG" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <T100A>
    <ARBGB>ZMSAG</ARBGB>
    <MASTERLANG>E</MASTERLANG>
    <STEXT>Message class</STEXT>
   </T100A>
   <T100>
    <T100>
     <SPRSL>E</SPRSL>
     <ARBGB>ZMSAG</ARBGB>
     <MSGNR>001</MSGNR>
     <TEXT>Short message</TEXT>
    </T100>
    <T100>
     <SPRSL>E</SPRSL>
     <ARBGB>ZMSAG</ARBGB>
     <MSGNR>002</MSGNR>
     <TEXT>This message text is way too long and definitively exceeds the seventy-three char limit</TEXT>
    </T100>
   </T100>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const issues = await runMsag(xml);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.include("TEXT[002]");
  });

  it("translation message text exceeds 73 characters", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_MSAG" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <T100A>
    <ARBGB>ZMSAG</ARBGB>
    <MASTERLANG>E</MASTERLANG>
    <STEXT>Message class</STEXT>
   </T100A>
   <T100>
    <T100>
     <SPRSL>E</SPRSL>
     <ARBGB>ZMSAG</ARBGB>
     <MSGNR>001</MSGNR>
     <TEXT>Short message</TEXT>
    </T100>
   </T100>
   <T100_TEXTS>
    <item>
     <SPRSL>F</SPRSL>
     <MSGNR>001</MSGNR>
     <TEXT>This translated text is way too long and definitively exceeds the seventy-three char limit</TEXT>
    </item>
   </T100_TEXTS>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const issues = await runMsag(xml);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.include("[F]");
    expect(issues[0].getMessage()).to.include("73");
  });

  it("translation message texts within 73 characters have no issues", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_MSAG" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <T100A>
    <ARBGB>ZMSAG</ARBGB>
    <MASTERLANG>E</MASTERLANG>
    <STEXT>Message class</STEXT>
   </T100A>
   <T100>
    <T100>
     <SPRSL>E</SPRSL>
     <ARBGB>ZMSAG</ARBGB>
     <MSGNR>001</MSGNR>
     <TEXT>Short message</TEXT>
    </T100>
   </T100>
   <T100_TEXTS>
    <item>
     <SPRSL>D</SPRSL>
     <MSGNR>001</MSGNR>
     <TEXT>Kurze Nachricht</TEXT>
    </item>
   </T100_TEXTS>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const issues = await runMsag(xml);
    expect(issues.length).to.equal(0);
  });

});

async function runClas(xml: string): Promise<Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zcl_test.clas.xml", xml));
  return run(reg);
}

describe("rule, xml_consistency, CLAS text element length", () => {

  it("no issue when text element entry is within its LENGTH", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_CLAS" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <VSEOCLASS>
    <CLSNAME>ZCL_TEST</CLSNAME>
    <LANGU>E</LANGU>
    <DESCRIPT>Test class</DESCRIPT>
    <STATE>1</STATE>
    <CLSCCINCL>X</CLSCCINCL>
    <FIXPT>X</FIXPT>
    <UNICODE>X</UNICODE>
   </VSEOCLASS>
   <TPOOL>
    <item>
     <ID>I</ID>
     <KEY>001</KEY>
     <ENTRY>Short text</ENTRY>
     <LENGTH>50</LENGTH>
    </item>
   </TPOOL>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const issues = await runClas(xml);
    expect(issues.length).to.equal(0);
  });

  it("text element entry exactly at LENGTH limit is ok", async () => {
    const entry50 = "12345678901234567890123456789012345678901234567890";
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_CLAS" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <VSEOCLASS>
    <CLSNAME>ZCL_TEST</CLSNAME>
    <LANGU>E</LANGU>
    <DESCRIPT>Test class</DESCRIPT>
    <STATE>1</STATE>
    <CLSCCINCL>X</CLSCCINCL>
    <FIXPT>X</FIXPT>
    <UNICODE>X</UNICODE>
   </VSEOCLASS>
   <TPOOL>
    <item>
     <ID>I</ID>
     <KEY>001</KEY>
     <ENTRY>${entry50}</ENTRY>
     <LENGTH>50</LENGTH>
    </item>
   </TPOOL>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const issues = await runClas(xml);
    expect(issues.length).to.equal(0);
  });

  it("text element entry exceeds its LENGTH", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_CLAS" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <VSEOCLASS>
    <CLSNAME>ZCL_TEST</CLSNAME>
    <LANGU>E</LANGU>
    <DESCRIPT>Test class</DESCRIPT>
    <STATE>1</STATE>
    <CLSCCINCL>X</CLSCCINCL>
    <FIXPT>X</FIXPT>
    <UNICODE>X</UNICODE>
   </VSEOCLASS>
   <TPOOL>
    <item>
     <ID>I</ID>
     <KEY>001</KEY>
     <ENTRY>This text is longer than ten chars</ENTRY>
     <LENGTH>10</LENGTH>
    </item>
   </TPOOL>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const issues = await runClas(xml);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.include("ENTRY[001]");
    expect(issues[0].getMessage()).to.include("10");
  });

  it("translation text element entry exceeds its LENGTH", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_CLAS" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <VSEOCLASS>
    <CLSNAME>ZCL_TEST</CLSNAME>
    <LANGU>E</LANGU>
    <DESCRIPT>Test class</DESCRIPT>
    <STATE>1</STATE>
    <CLSCCINCL>X</CLSCCINCL>
    <FIXPT>X</FIXPT>
    <UNICODE>X</UNICODE>
   </VSEOCLASS>
   <TPOOL>
    <item>
     <ID>I</ID>
     <KEY>001</KEY>
     <ENTRY>Short text</ENTRY>
     <LENGTH>20</LENGTH>
    </item>
   </TPOOL>
   <I18N_TPOOL>
    <item>
     <LANGUAGE>F</LANGUAGE>
     <TEXTPOOL>
      <item>
       <ID>I</ID>
       <KEY>001</KEY>
       <ENTRY>Traduction beaucoup trop longue</ENTRY>
       <LENGTH>20</LENGTH>
      </item>
     </TEXTPOOL>
    </item>
   </I18N_TPOOL>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const issues = await runClas(xml);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.include("[F]");
    expect(issues[0].getMessage()).to.include("ENTRY[001]");
  });

  it("translation text element within LENGTH has no issues", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_CLAS" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <VSEOCLASS>
    <CLSNAME>ZCL_TEST</CLSNAME>
    <LANGU>E</LANGU>
    <DESCRIPT>Test class</DESCRIPT>
    <STATE>1</STATE>
    <CLSCCINCL>X</CLSCCINCL>
    <FIXPT>X</FIXPT>
    <UNICODE>X</UNICODE>
   </VSEOCLASS>
   <TPOOL>
    <item>
     <ID>I</ID>
     <KEY>001</KEY>
     <ENTRY>Short text</ENTRY>
     <LENGTH>50</LENGTH>
    </item>
   </TPOOL>
   <I18N_TPOOL>
    <item>
     <LANGUAGE>D</LANGUAGE>
     <TEXTPOOL>
      <item>
       <ID>I</ID>
       <KEY>001</KEY>
       <ENTRY>Kurzer Text</ENTRY>
       <LENGTH>50</LENGTH>
      </item>
     </TEXTPOOL>
    </item>
   </I18N_TPOOL>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const issues = await runClas(xml);
    expect(issues.length).to.equal(0);
  });

});
