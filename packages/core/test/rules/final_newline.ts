import {expect} from "chai";
import {applyEditSingle} from "../../src/edit_helper";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {FinalNewline} from "../../src/rules";
import {testRule, testRuleFix} from "./_utils";

const tests = [
  {abap: "WRITE 'hello'.\n", cnt: 0},
  {abap: "WRITE 'hello'.\nWRITE 'world'.\n", cnt: 0},
  {abap: "WRITE 'hello'.\r\n", cnt: 0},
  {abap: "WRITE 'hello'.\n\nWRITE 'world'.\n", cnt: 0},
  {abap: "", cnt: 0},
  {abap: "\n", cnt: 0},
  {abap: "WRITE 'hello'.", cnt: 1, fix: true},
  {abap: "WRITE 'hello'.\nWRITE 'world'.", cnt: 1, fix: true},
  {abap: "WRITE 'hello'.\r", cnt: 1, fix: true},
  {abap: "WRITE 'hello'.\n\n", cnt: 1, fix: true},
  {abap: "WRITE 'hello'.\n\n\n", cnt: 1, fix: true},
  {abap: "WRITE 'hello'.\r\n\r\n", cnt: 1, fix: true},
];

testRule(tests, FinalNewline);

const fixes = [
  {input: "WRITE 'hello'.", output: "WRITE 'hello'.\n"},
  {input: "WRITE 'hello'.\nWRITE 'world'.", output: "WRITE 'hello'.\nWRITE 'world'.\n"},
  {input: "WRITE 'hello'.\n\n", output: "WRITE 'hello'.\n"},
  {input: "WRITE 'hello'.\n\n\n\n", output: "WRITE 'hello'.\n"},
  {input: "WRITE 'hello'.\r\n\r\n", output: "WRITE 'hello'.\r\n"},
];

testRuleFix(fixes, FinalNewline);

const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_INTF" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <VSEOINTERF>
    <CLSNAME>ZIF_FOO</CLSNAME>
    <LANGU>E</LANGU>
    <DESCRIPT>foo</DESCRIPT>
    <EXPOSURE>2</EXPOSURE>
    <STATE>1</STATE>
    <UNICODE>X</UNICODE>
   </VSEOINTERF>
  </asx:values>
 </asx:abap>
</abapGit>`;

const abap = `INTERFACE zif_foo PUBLIC.
ENDINTERFACE.
`;

function run(files: {filename: string, contents: string}[]) {
  const reg = new Registry();
  for (const f of files) {
    reg.addFile(new MemoryFile(f.filename, f.contents));
  }
  reg.parse();
  const issues = new FinalNewline().initialize(reg).run(reg.getFirstObject()!);
  return {reg, issues};
}

describe("rule, final_newline, xml files", () => {
  it("reports the XML file without a final newline", () => {
    const {issues} = run([
      {filename: "zif_foo.intf.abap", contents: abap},
      {filename: "zif_foo.intf.xml", contents: xml}]);
    expect(issues).to.have.length(1);
    expect(issues[0].getFilename()).to.equal("zif_foo.intf.xml");
    expect(issues[0].getMessage()).to.equal("Add newline at end of file");
  });

  it("accepts both files ending with one newline", () => {
    const {issues} = run([
      {filename: "zif_foo.intf.abap", contents: abap},
      {filename: "zif_foo.intf.xml", contents: xml + "\n"}]);
    expect(issues).to.have.length(0);
  });

  it("reports XML and ABAP file of the same object", () => {
    const {issues} = run([
      {filename: "zif_foo.intf.abap", contents: abap + "\n"},
      {filename: "zif_foo.intf.xml", contents: xml}]);
    expect(issues).to.have.length(2);
  });

  it("fixes the XML file", () => {
    const {reg, issues} = run([{filename: "zif_foo.intf.xml", contents: xml}]);
    applyEditSingle(reg, issues[0].getDefaultFix()!);
    expect(reg.getFileByName("zif_foo.intf.xml")!.getRaw()).to.equal(xml + "\n");
  });

  it("does not check XSLT sources", () => {
    const {issues} = run([{filename: "zfoo.xslt.source.xml", contents: "<xsl:transform/>"}]);
    expect(issues).to.have.length(0);
  });

  it("does not check MIME objects", () => {
    const {issues} = run([{filename: "zfoo.w3mi.data.xml", contents: "<foo/>"}]);
    expect(issues).to.have.length(0);
  });
});
