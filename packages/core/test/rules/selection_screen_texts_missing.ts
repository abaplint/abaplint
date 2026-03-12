import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {SelectionScreenTextsMissing} from "../../src/rules";
import {Issue} from "../../src/issue";

function run(reg: Registry): Issue[] {
  reg.parse();
  const rule = new SelectionScreenTextsMissing();
  return rule.initialize(reg).run(reg.getFirstObject()!) as Issue[];
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

  it("parameter with selection text, no issue", () => {
    const abap = "PARAMETERS p_test TYPE string.";
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xml));
    const issues = run(reg);
    expect(issues.length).to.equal(0);
  });

  it("parameter without selection text, issue", () => {
    const abap = "PARAMETERS p_miss TYPE string.";
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xml));
    const issues = run(reg);
    expect(issues.length).to.equal(1);
  });

  it("select-option with selection text, no issue", () => {
    const abap = `DATA foo TYPE string.
SELECT-OPTIONS s_field FOR foo.`;
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xml));
    const issues = run(reg);
    expect(issues.length).to.equal(0);
  });

  it("select-option without selection text, issue", () => {
    const abap = `DATA foo TYPE string.
SELECT-OPTIONS s_miss FOR foo.`;
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xml));
    const issues = run(reg);
    expect(issues.length).to.equal(1);
  });

  it("no xml file, parameter gives issue", () => {
    const abap = "PARAMETERS p_test TYPE string.";
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    const issues = run(reg);
    expect(issues.length).to.equal(1);
  });

  it("no selection texts in xml, parameter gives issue", () => {
    const abap = "PARAMETERS p_test TYPE string.";
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xmlNoSelTexts));
    const issues = run(reg);
    expect(issues.length).to.equal(1);
  });

  it("no parameters or select-options, no issues", () => {
    const abap = "WRITE 'hello'.";
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xml));
    const issues = run(reg);
    expect(issues.length).to.equal(0);
  });

  it("multiple parameters, mixed results", () => {
    const abap = `PARAMETERS p_test TYPE string.
PARAMETERS p_miss TYPE string.`;
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xml));
    const issues = run(reg);
    expect(issues.length).to.equal(1);
  });

  it("lower case parameter name matches", () => {
    const abap = "PARAMETERS p_test TYPE string.";
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xml));
    const issues = run(reg);
    expect(issues.length).to.equal(0);
  });

});
