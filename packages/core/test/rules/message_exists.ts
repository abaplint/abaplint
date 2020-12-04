import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {MessageExistsRule} from "../../src/rules";
import {expect} from "chai";
import {Issue} from "../../src/issue";

async function run(abap: string): Promise<readonly Issue[]> {
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
  await reg.parseAsync();
  return new MessageExistsRule().initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule message_exists", () => {
  it("parser error", async () => {
    const abap = "sfsdfd";
    const issues = await run(abap);
    expect(issues.length).to.equals(0);
  });

  it("zero issues", async () => {
    const abap = "WRITE hello.";
    const issues = await run(abap);
    expect(issues.length).to.equals(0);
  });

  it("REPORT, message class not found, and not in error namespace", async () => {
    const abap = "REPORT zfoobar MESSAGE-ID asdf.";
    const issues = await run(abap);
    expect(issues.length).to.equals(0);
  });

  it("REPORT, message class not found, in error namespace", async () => {
    const abap = "REPORT zfoobar MESSAGE-ID zasdf.";
    const issues = await run(abap);
    expect(issues.length).to.equals(1);
  });

  it("REPORT, message class found", async () => {
    const abap = "REPORT zfoobar MESSAGE-ID zag_unit_test.";
    const issues = await run(abap);
    expect(issues.length).to.equals(0);
  });

  it("MESSAGE, class not found", async () => {
    const abap = "MESSAGE e000(zsdf).";
    const issues = await run(abap);
    expect(issues.length).to.equals(1);
  });

  it("MESSAGE, number not found", async () => {
    const abap = "MESSAGE e123(zag_unit_test).";
    const issues = await run(abap);
    expect(issues.length).to.equals(1);
  });

  it("MESSAGE, number", async () => {
    const abap = "MESSAGE e000(zag_unit_test).";
    const issues = await run(abap);
    expect(issues.length).to.equals(0);
  });

  it("MESSAGE, escaped name", async () => {
    const xml =
      "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
      "<abapGit version=\"v1.0.0\" serializer=\"LCL_OBJECT_MSAG\" serializer_version=\"v1.0.0\">\n" +
      " <asx:abap xmlns:asx=\"http://www.sap.com/abapxml\" version=\"1.0\">\n" +
      "  <asx:values>\n" +
      "   <T100A>\n" +
      "    <ARBGB>&gt;6</ARBGB>\n" +
      "    <MASTERLANG>D</MASTERLANG>\n" +
      "    <STEXT>test</STEXT>\n" +
      "   </T100A>\n" +
      "   <T100>\n" +
    `<T100>
     <SPRSL>E</SPRSL>
     <ARBGB>&gt;6</ARBGB>
     <MSGNR>001</MSGNR>
     <TEXT>foobar</TEXT>
    </T100>` +
      "   </T100>\n" +
      "  </asx:values>\n" +
      " </asx:abap>\n" +
      "</abapGit>";

    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoobar.prog.abap", "MESSAGE e001(>6)."));
    reg.addFile(new MemoryFile("%3e6.msag.xml", xml));
    await reg.parseAsync();
    const issues = new MessageExistsRule().initialize(reg).run(reg.getFirstObject()!);
    expect(issues.length).to.equal(0);
  });

});