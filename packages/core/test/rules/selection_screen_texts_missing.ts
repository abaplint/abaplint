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

});
