import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {MessageExistsRule} from "../../src/rules";
import {expect} from "chai";
import {Issue} from "../../src/issue";

function run(abap: string): readonly Issue[] {
  const xml =
    "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
    "<abapGit version=\"v1.0.0\" serializer=\"LCL_OBJECT_MSAG\" serializer_version=\"v1.0.0\">\n" +
    " <asx:abap xmlns:asx=\"http://www.sap.com/abapxml\" version=\"1.0\">\n" +
    "  <asx:values>\n" +
    "   <T100A>\n" +
    "    <ARBGB>ZAG_UNIT_TEST</ARBGB>\n" +
    "    <MASTERLANG>E</MASTERLANG>\n" +
    "    <STEXT>test</STEXT>\n" +
    "   </T100A>\n" +
    "   <T100>\n" +
    "    <T100>\n" +
    "     <SPRSL>E</SPRSL>\n" +
    "     <ARBGB>ZAG_UNIT_TEST</ARBGB>\n" +
    "     <MSGNR>000</MSGNR>\n" +
    "     <TEXT>hello world &amp;</TEXT>\n" +
    "    </T100>\n" +
    "   </T100>\n" +
    "  </asx:values>\n" +
    " </asx:abap>\n" +
    "</abapGit>";

  const reg = new Registry();
  reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
  reg.addFile(new MemoryFile("zag_unit_test.msag.xml", xml));
  reg.parse();
  return new MessageExistsRule().run(reg.getObjects()[0], reg);
}

describe("Message rule", () => {
  it("parser error", () => {
    const abap = "sfsdfd";
    const issues = run(abap);
    expect(issues.length).to.equals(0);
  });

  it("zero issues", () => {
    const abap = "WRITE hello.";
    const issues = run(abap);
    expect(issues.length).to.equals(0);
  });

  it("REPORT, message class not found", () => {
    const abap = "REPORT zfoobar MESSAGE-ID asdf.";
    const issues = run(abap);
    expect(issues.length).to.equals(1);
  });

  it("REPORT, message class found", () => {
    const abap = "REPORT zfoobar MESSAGE-ID zag_unit_test.";
    const issues = run(abap);
    expect(issues.length).to.equals(0);
  });

  it("MESSAGE, not class found", () => {
    const abap = "MESSAGE e000(zsdf).";
    const issues = run(abap);
    expect(issues.length).to.equals(1);
  });

  it("MESSAGE, number not found", () => {
    const abap = "MESSAGE e123(zag_unit_test).";
    const issues = run(abap);
    expect(issues.length).to.equals(1);
  });

  it("MESSAGE, number", () => {
    const abap = "MESSAGE e000(zag_unit_test).";
    const issues = run(abap);
    expect(issues.length).to.equals(0);
  });
});