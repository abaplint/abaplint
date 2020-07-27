import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {CheckTextElements} from "../../src/rules";
import {IRegistry} from "../../src/_iregistry";
import {Issue} from "../../src/issue";

async function run(reg: IRegistry): Promise<Issue[]> {
  await reg.parseAsync();
  return new CheckTextElements().initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: check_text_elements", () => {
  const clas = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_CLAS" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <VSEOCLASS>
    <CLSNAME>ZCL_AOC_EMBEDDED_PACKAGES</CLSNAME>
    <LANGU>E</LANGU>
    <DESCRIPT>Embedded packages</DESCRIPT>
    <STATE>1</STATE>
    <CLSCCINCL>X</CLSCCINCL>
    <FIXPT>X</FIXPT>
    <UNICODE>X</UNICODE>
   </VSEOCLASS>
   <TPOOL>
    <item>
     <ID>I</ID>
     <KEY>000</KEY>
     <ENTRY>AOC - Objects from Embedded Packages</ENTRY>
     <LENGTH>72</LENGTH>
    </item>
    <item>
     <ID>I</ID>
     <KEY>001</KEY>
     <ENTRY>Packages</ENTRY>
     <LENGTH>18</LENGTH>
    </item>
    <item>
     <ID>I</ID>
     <KEY>002</KEY>
     <ENTRY>Local objects only</ENTRY>
     <LENGTH>28</LENGTH>
    </item>
   </TPOOL>
  </asx:values>
 </asx:abap>
</abapGit>`;

  const prog = `<?xml version="1.0" encoding="utf-8"?>
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

  it("test 1, prog", async () => {
    const abap = "WRITE hello.";
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", prog));
    const issues = await run(reg);
    expect(issues.length).to.equal(0);
  });

/* todo, the parser finds this to be a FieldChain
  it("test 2", function () {
    const abap = "WRITE TEXT-003.";
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xml));
    reg.parse();
    const issues = new CheckTextElements().run(reg.getFirstObject()!);
    expect(issues.length).to.equal(1);
  });
*/

  it("test 3, prog", async () => {
    const abap = "WRITE TEXT-001.";
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", prog));
    const issues = await run(reg);
    expect(issues.length).to.equal(0);
  });

  it("test 4, prog", async () => {
    const abap = "WRITE TEXT-ABC.";
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", prog));
    const issues = await run(reg);
    expect(issues.length).to.equal(0);
  });

  it("test 4, lower case, prog", async () => {
    const abap = "WRITE text-abc.";
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", prog));
    const issues = await run(reg);
    expect(issues.length).to.equal(0);
  });

  it("test 5, prog", async () => {
    const abap = "WRITE 'sdfsd'(003).";
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", prog));
    const issues = await run(reg);
    expect(issues.length).to.equal(1);
  });

  it("test 6, prog", async () => {
    const abap = "WRITE 'hello world 1'(001).";
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", prog));
    const issues = await run(reg);
    expect(issues.length).to.equal(0);
  });

  it("test 7, prog", async () => {
    const abap = "WRITE 'something else'(001).";
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", prog));
    const issues = await run(reg);
    expect(issues.length).to.equal(1);
  });

  it("test 8, prog", async () => {
    const abap = "WRITE `something else`(001).";
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", prog));
    const issues = await run(reg);
    expect(issues.length).to.equal(1);
  });

  it("test 9, prog", async () => {
    const abap = "WRITE '''Editor Lock'' is set.'(111).";
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", prog));
    const issues = await run(reg);
    expect(issues.length).to.equal(0);
  });

  it("test 10, prog", async () => {
    const abap = `
SELECTION-SCREEN BEGIN OF BLOCK cls WITH FRAME TITLE text-abc.
SELECTION-SCREEN END OF BLOCK cls.
    `;
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", prog));
    const issues = await run(reg);
    expect(issues.length).to.equal(0);
  });

  it("test 11, prog", async () => {
    const abap = `
SELECTION-SCREEN PUSHBUTTON 60(30) text-001 USER-COMMAND btn.
    `;
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", prog));
    const issues = await run(reg);
    expect(issues.length).to.equal(0);
  });

  it("test 12, prog", async () => {
    const abap = `
SELECTION-SCREEN PUSHBUTTON 60(30) text-003 USER-COMMAND btn.
    `;
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
    reg.addFile(new MemoryFile("zfoobar.prog.xml", prog));
    const issues = await run(reg);
    expect(issues.length).to.equal(1);
  });

  it("test 13, clas", async () => {
    const abap = `
  CLASS zcl_aoc_embedded_packages DEFINITION PUBLIC CREATE PUBLIC .
    PUBLIC SECTION.
      METHODS constructor .
  ENDCLASS.

  CLASS ZCL_AOC_EMBEDDED_PACKAGES IMPLEMENTATION.
    METHOD constructor.
      description = 'AOC - Objects from Embedded Packages'(000).
    ENDMETHOD.
  ENDCLASS.`;
    const reg = new Registry();
    reg.addFile(new MemoryFile("zcl_aoc_embedded_packages.clas.abap", abap));
    reg.addFile(new MemoryFile("zcl_aoc_embedded_packages.clas.xml", clas));
    const issues = await run(reg);
    expect(issues.length).to.equal(0);
  });

});
