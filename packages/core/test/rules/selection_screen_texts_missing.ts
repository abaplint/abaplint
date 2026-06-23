import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {SelectionScreenTextsMissing} from "../../src/rules";
import {Issue} from "../../src/issue";

async function run(reg: Registry): Promise<Issue[]> {
  await reg.parseAsync();
  let issues: Issue[] = [];
  const rule = new SelectionScreenTextsMissing().initialize(reg);
  for (const obj of reg.getObjects()) {
    issues = issues.concat(rule.run(obj));
  }
  return issues;
}

const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_PROG" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <PROGDIR>
    <NAME>ZFOOBAR</NAME>
    <SUBC>1</SUBC>
    <RLOAD>E</RLOAD>
    <FIXPT>X</FIXPT>
    <UCCHECK>X</UCCHECK>
   </PROGDIR>
   <TPOOL>
    <item>
     <ID>S</ID>
     <KEY>P_TEST</KEY>
     <ENTRY>        Test Parameter</ENTRY>
     <LENGTH>23</LENGTH>
    </item>
    <item>
     <ID>S</ID>
     <KEY>S_FIELD</KEY>
     <ENTRY>        Field Selection</ENTRY>
     <LENGTH>24</LENGTH>
    </item>
    <item>
     <ID>R</ID>
     <ENTRY>Program ZFOOBAR</ENTRY>
     <LENGTH>28</LENGTH>
    </item>
   </TPOOL>
  </asx:values>
 </asx:abap>
</abapGit>`;

const xmlNoSelTexts = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_PROG" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <PROGDIR>
    <NAME>ZFOOBAR</NAME>
    <SUBC>1</SUBC>
    <RLOAD>E</RLOAD>
    <FIXPT>X</FIXPT>
    <UCCHECK>X</UCCHECK>
   </PROGDIR>
   <TPOOL>
    <item>
     <ID>R</ID>
     <ENTRY>Program ZFOOBAR</ENTRY>
     <LENGTH>28</LENGTH>
    </item>
   </TPOOL>
  </asx:values>
 </asx:abap>
</abapGit>`;

describe("Rule: selection_screen_texts_missing", () => {

  it("parameter with selection text, no issue", async () => {
    const abap = "PARAMETERS p_test TYPE string.";
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xml));
    const issues = await run(reg);
    expect(issues.length).to.equal(0);
  });

  it("parameter without selection text, issue", async () => {
    const abap = "PARAMETERS p_miss TYPE string.";
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xml));
    const issues = await run(reg);
    expect(issues.length).to.equal(1);
  });

  it("select-option with selection text, no issue", async () => {
    const abap = `DATA foo TYPE string.
SELECT-OPTIONS s_field FOR foo.`;
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xml));
    const issues = await run(reg);
    expect(issues.length).to.equal(0);
  });

  it("select-option without selection text, issue", async () => {
    const abap = `DATA foo TYPE string.
SELECT-OPTIONS s_miss FOR foo.`;
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xml));
    const issues = await run(reg);
    expect(issues.length).to.equal(1);
  });

  it("no xml file, parameter gives issue", async () => {
    const abap = "PARAMETERS p_test TYPE string.";
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    const issues = await run(reg);
    expect(issues.length).to.equal(1);
  });

  it("no selection texts in xml, parameter gives issue", async () => {
    const abap = "PARAMETERS p_test TYPE string.";
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xmlNoSelTexts));
    const issues = await run(reg);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.not.include("zfoobar");
  });

  it("no parameters or select-options, no issues", async () => {
    const abap = "WRITE 'hello'.";
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xml));
    const issues = await run(reg);
    expect(issues.length).to.equal(0);
  });

  it("multiple parameters, mixed results", async () => {
    const abap = `PARAMETERS p_test TYPE string.
PARAMETERS p_miss TYPE string.`;
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xml));
    const issues = await run(reg);
    expect(issues.length).to.equal(1);
  });

  it("lower case parameter name matches", async () => {
    const abap = "PARAMETERS p_test TYPE string.";
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xml));
    const issues = await run(reg);
    expect(issues.length).to.equal(0);
  });

  it("parameter in INCLUDE, selection text in main program, no issue", async () => {
    const mainAbap = "INCLUDE zfoobar_sel.";
    const inclAbap = "PARAMETERS p_test TYPE string.";
    const inclXml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_PROG" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <PROGDIR>
    <NAME>ZFOOBAR_SEL</NAME>
    <SUBC>I</SUBC>
    <RLOAD>E</RLOAD>
    <UCCHECK>X</UCCHECK>
   </PROGDIR>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", mainAbap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xml));
    reg.addFile(new MemoryFile("zfoobar_sel.prog.abap", inclAbap));
    reg.addFile(new MemoryFile("zfoobar_sel.prog.xml", inclXml));
    const issues = await run(reg);
    expect(issues.length).to.equal(0);
  });

  it("parameter in INCLUDE, selection text missing in main program, issue", async () => {
    const mainAbap = "INCLUDE zfoobar_sel.";
    const inclAbap = "PARAMETERS p_miss TYPE string.";
    const inclXml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_PROG" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <PROGDIR>
    <NAME>ZFOOBAR_SEL</NAME>
    <SUBC>I</SUBC>
    <RLOAD>E</RLOAD>
    <UCCHECK>X</UCCHECK>
   </PROGDIR>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", mainAbap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xml));
    reg.addFile(new MemoryFile("zfoobar_sel.prog.abap", inclAbap));
    reg.addFile(new MemoryFile("zfoobar_sel.prog.xml", inclXml));
    const issues = await run(reg);
    expect(issues.length).to.equal(1);
  });

  it("INCLUDE before PARAMETER in main program: issue should not include program name", async () => {
    const mainAbap = `INCLUDE zfoobar_sel.
PARAMETERS p_miss TYPE string.`;
    const inclAbap = "WRITE 'hello'.";
    const inclXml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_PROG" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <PROGDIR>
    <NAME>ZFOOBAR_SEL</NAME>
    <SUBC>I</SUBC>
    <RLOAD>E</RLOAD>
    <UCCHECK>X</UCCHECK>
   </PROGDIR>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", mainAbap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xmlNoSelTexts));
    reg.addFile(new MemoryFile("zfoobar_sel.prog.abap", inclAbap));
    reg.addFile(new MemoryFile("zfoobar_sel.prog.xml", inclXml));
    const issues = await run(reg);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.not.include("zfoobar");
  });

  it("two programs share an INCLUDE, only one missing text: issue names the correct program", async () => {
    const inclAbap = "PARAMETERS p_test TYPE string.";
    const inclXml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_PROG" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <PROGDIR>
    <NAME>ZSHARED_SEL</NAME>
    <SUBC>I</SUBC>
    <RLOAD>E</RLOAD>
    <UCCHECK>X</UCCHECK>
   </PROGDIR>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const prog1Abap = "INCLUDE zshared_sel.";
    const prog1Xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_PROG" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <PROGDIR>
    <NAME>ZPROG1</NAME>
    <SUBC>1</SUBC>
    <RLOAD>E</RLOAD>
    <FIXPT>X</FIXPT>
    <UCCHECK>X</UCCHECK>
   </PROGDIR>
   <TPOOL>
    <item>
     <ID>S</ID>
     <KEY>P_TEST</KEY>
     <ENTRY>        Test Parameter</ENTRY>
     <LENGTH>23</LENGTH>
    </item>
   </TPOOL>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const prog2Abap = "INCLUDE zshared_sel.";
    const prog2Xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_PROG" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <PROGDIR>
    <NAME>ZPROG2</NAME>
    <SUBC>1</SUBC>
    <RLOAD>E</RLOAD>
    <FIXPT>X</FIXPT>
    <UCCHECK>X</UCCHECK>
   </PROGDIR>
   <TPOOL>
    <item>
     <ID>R</ID>
     <ENTRY>Program ZPROG2</ENTRY>
     <LENGTH>28</LENGTH>
    </item>
   </TPOOL>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry();
    reg.addFile(new MemoryFile("zshared_sel.prog.abap", inclAbap));
    reg.addFile(new MemoryFile("zshared_sel.prog.xml", inclXml));
    reg.addFile(new MemoryFile("zprog1.prog.abap", prog1Abap));
    reg.addFile(new MemoryFile("zprog1.prog.xml", prog1Xml));
    reg.addFile(new MemoryFile("zprog2.prog.abap", prog2Abap));
    reg.addFile(new MemoryFile("zprog2.prog.xml", prog2Xml));

    const issues = await run(reg);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.include(", zprog2.prog.abap");
  });

  it("parameter with NO-DISPLAY, no issue", async () => {
    const abap = `PARAMETERS p_miss TYPE string NO-DISPLAY.`;
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xmlNoSelTexts));
    const issues = await run(reg);
    expect(issues.length).to.equal(0);
  });

  it("select-option with NO-DISPLAY, no issue", async () => {
    const abap = `DATA foo TYPE string.
SELECT-OPTIONS s_miss FOR foo NO-DISPLAY.`;
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xmlNoSelTexts));
    const issues = await run(reg);
    expect(issues.length).to.equal(0);
  });

  it("parameter inside BEGIN OF LINE block, no issue", async () => {
    const abap = `SELECTION-SCREEN BEGIN OF LINE.
  PARAMETERS p_miss TYPE string.
SELECTION-SCREEN END OF LINE.`;
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xmlNoSelTexts));
    const issues = await run(reg);
    expect(issues.length).to.equal(0);
  });

  it("mixed: parameter inside and outside BEGIN OF LINE, one issue", async () => {
    const abap = `SELECTION-SCREEN BEGIN OF LINE.
  PARAMETERS p_miss TYPE string.
SELECTION-SCREEN END OF LINE.
PARAMETERS p_miss2 TYPE string.`;
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xmlNoSelTexts));
    const issues = await run(reg);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.include("P_MISS2");
  });

});
