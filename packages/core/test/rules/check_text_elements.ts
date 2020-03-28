import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {CheckTextElements} from "../../src/rules";

describe("Rule: check_text_elements", () => {
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
     <ID>I</ID>
     <KEY>001</KEY>
     <ENTRY>hello world 1</ENTRY>
     <LENGTH>22</LENGTH>
    </item>
    <item>
     <ID>I</ID>
     <KEY>ABC</KEY>
     <ENTRY>hello world 2</ENTRY>
     <LENGTH>22</LENGTH>
    </item>
    <item>
     <ID>I</ID>
     <KEY>111</KEY>
     <ENTRY>&apos;Editor Lock&apos; is set.</ENTRY>
     <LENGTH>42</LENGTH>
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

  it("test 1", () => {
    const abap = "WRITE hello.";
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xml));
    reg.parse();
    const issues = new CheckTextElements().run(reg.getObjects()[0], reg);
    expect(issues.length).to.equal(0);
  });

/* todo, the parser finds this to be a FieldChain
  it("test 2", function () {
    const abap = "WRITE TEXT-003.";
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xml));
    reg.parse();
    const issues = new CheckTextElements().run(reg.getObjects()[0]);
    expect(issues.length).to.equal(1);
  });
*/

  it("test 3", () => {
    const abap = "WRITE TEXT-001.";
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xml));
    reg.parse();
    const issues = new CheckTextElements().run(reg.getObjects()[0], reg);
    expect(issues.length).to.equal(0);
  });

  it("test 4", () => {
    const abap = "WRITE TEXT-ABC.";
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xml));
    reg.parse();
    const issues = new CheckTextElements().run(reg.getObjects()[0], reg);
    expect(issues.length).to.equal(0);
  });

  it("test 5", () => {
    const abap = "WRITE 'sdfsd'(003).";
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xml));
    reg.parse();
    const issues = new CheckTextElements().run(reg.getObjects()[0], reg);
    expect(issues.length).to.equal(1);
  });

  it("test 6", () => {
    const abap = "WRITE 'hello world 1'(001).";
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xml));
    reg.parse();
    const issues = new CheckTextElements().run(reg.getObjects()[0], reg);
    expect(issues.length).to.equal(0);
  });

  it("test 7", () => {
    const abap = "WRITE 'something else'(001).";
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xml));
    reg.parse();
    const issues = new CheckTextElements().run(reg.getObjects()[0], reg);
    expect(issues.length).to.equal(1);
  });

  it("test 8", () => {
    const abap = "WRITE `something else`(001).";
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xml));
    reg.parse();
    const issues = new CheckTextElements().run(reg.getObjects()[0], reg);
    expect(issues.length).to.equal(1);
  });

  it("test 9", () => {
    const abap = "WRITE '''Editor Lock'' is set.'(111).";
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xml));
    reg.parse();
    const issues = new CheckTextElements().run(reg.getObjects()[0], reg);
    expect(issues.length).to.equal(0);
  });

});