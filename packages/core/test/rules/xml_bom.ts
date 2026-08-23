import {expect} from "chai";
import {applyEditSingle} from "../../src/edit_helper";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {XMLBOM} from "../../src/rules";

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

function run(contents: string) {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.xml", contents)).parse();
  const issues = new XMLBOM().initialize(reg).run(reg.getFirstObject()!);
  return {reg, issues};
}

describe("rule, xml_bom", () => {
  it("reports XML files without a BOM", () => {
    const {issues} = run(xml);
    expect(issues).to.have.length(1);
    expect(issues[0].getMessage()).to.equal("XML file must start with a UTF-8 byte order mark");
  });

  it("accepts XML files with a BOM", () => {
    const {issues} = run("\uFEFF" + xml);
    expect(issues).to.have.length(0);
  });

  it("adds a BOM with its quick fix", () => {
    const {reg, issues} = run(xml);
    const fix = issues[0].getDefaultFix();
    expect(fix).to.not.equal(undefined);
    applyEditSingle(reg, fix!);

    expect(reg.getFileByName("zfoo.prog.xml")!.getRaw()).to.equal("\uFEFF" + xml);
    const afterFix = new XMLBOM().initialize(reg).run(reg.getFirstObject()!);
    expect(afterFix).to.have.length(0);
  });
});
