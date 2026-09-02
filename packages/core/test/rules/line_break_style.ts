import {expect} from "chai";
import {testRule} from "./_utils";
import {LineBreakStyle} from "../../src/rules";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";

const tests = [
  {abap: "WRITE: / 'abc'.", cnt: 0},
  {abap: "", cnt: 0},
  {abap: "  ", cnt: 0},
  {abap: "method( \r).", cnt: 0}, // caught by 7bit_ascii
  {abap: "method( \r\n).", cnt: 1},
  {abap: "method( \n).", cnt: 0},
];

testRule(tests, LineBreakStyle);

const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_PROG" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <PROGDIR>
    <NAME>ZFOO</NAME>
    <SUBC>1</SUBC>
    <FIXPT>X</FIXPT>
    <UCCHECK>X</UCCHECK>
   </PROGDIR>
  </asx:values>
 </asx:abap>
</abapGit>`;

const crlf = xml.replace(/\n/g, "\r\n");

function runFile(filename: string, contents: string) {
  const reg = new Registry().addFile(new MemoryFile(filename, contents)).parse();
  return new LineBreakStyle().initialize(reg).run(reg.getFirstObject()!);
}

describe("rule, line_break_style, xml", () => {
  it("reports XML files with CRLF", () => {
    const issues = runFile("zfoo.prog.xml", crlf);
    expect(issues).to.have.length(1);
    expect(issues[0].getMessage()).to.equal("Line contains carriage return");
  });

  it("accepts XML files with LF", () => {
    const issues = runFile("zfoo.prog.xml", xml);
    expect(issues).to.have.length(0);
  });

  it("skips W3MI files", () => {
    const reg = new Registry()
      .addFile(new MemoryFile("zfoo.w3mi.xml", crlf))
      .addFile(new MemoryFile("zfoo.w3mi.data.xml", crlf))
      .parse();
    const issues = new LineBreakStyle().initialize(reg).run(reg.getFirstObject()!);
    expect(issues).to.have.length(0);
  });
});
