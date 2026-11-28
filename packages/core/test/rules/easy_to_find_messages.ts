import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {EasyToFindMessages} from "../../src/rules";
import {expect} from "chai";
import {Issue} from "../../src/issue";
import {ABAPObject} from "../../src/objects/_abap_object";

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

async function run(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry();
  reg.addFile(new MemoryFile("zag_unit_test.msag.xml", xml));
  reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
  await reg.parseAsync();
  return new EasyToFindMessages().initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule easy_to_find_messages", () => {

  it("parser error", async () => {
    const abap = "sfsdfd";
    const issues = await run(abap);
    expect(issues.length).to.equals(1);
  });

  it("not in use", async () => {
    const abap = "WRITE hello.";
    const issues = await run(abap);
    expect(issues.length).to.equals(1);
  });

  it("MESSAGE, number, ok", async () => {
    const abap = "MESSAGE e000(zag_unit_test).";
    const issues = await run(abap);
    expect(issues.length).to.equals(0);
  });

  it("MESSAGE, number, ok", async () => {
    const abap = "MESSAGE ID 'ZAG_UNIT_TEST' TYPE 'I' NUMBER 000.";
    const issues = await run(abap);
    expect(issues.length).to.equals(0);
  });

  it("RAISE, number, ok", async () => {
    const abap = `RAISE EXCEPTION TYPE cx_voided MESSAGE ID 'ZAG_UNIT_TEST' NUMBER 000.`;
    const issues = await run(abap);
    expect(issues.length).to.equals(0);
  });

  it("RAISE, number, ok", async () => {
    const abap = `RAISE EXCEPTION TYPE cx_voided MESSAGE e000(zag_unit_test).`;
    const issues = await run(abap);
    expect(issues.length).to.equals(0);
  });

  it("MESSAGE, double use, error", async () => {
    const abap = `
    MESSAGE e000(zag_unit_test).
    MESSAGE e000(zag_unit_test).
    `;
    const issues = await run(abap);
    expect(issues.length).to.equals(1);
  });

  it("only referenced from dependency", async () => {
    const reg = new Registry();
    reg.addFile(new MemoryFile("zag_unit_test.msag.xml", xml));
    reg.addDependency(new MemoryFile("zdep.prog.abap", "MESSAGE e000(zag_unit_test)."));
    await reg.parseAsync();
    const issues = new EasyToFindMessages().initialize(reg).run(reg.getObject("MSAG", "ZAG_UNIT_TEST")!);
    expect(issues.length).to.equals(0);
  });

  it("dependency not mentioning the message class is not syntax checked", async () => {
    const reg = new Registry();
    reg.addFile(new MemoryFile("zag_unit_test.msag.xml", xml));
    reg.addDependency(new MemoryFile("zdep.prog.abap", "WRITE 2."));
    await reg.parseAsync();
    const issues = new EasyToFindMessages().initialize(reg).run(reg.getObject("MSAG", "ZAG_UNIT_TEST")!);
    expect(issues.length).to.equals(1);
    expect((reg.getObject("PROG", "ZDEP") as ABAPObject).syntaxResult).to.equal(undefined);
  });

  it("referenced in include, main program is a dependency", async () => {
    const reg = new Registry();
    reg.addFile(new MemoryFile("zag_unit_test.msag.xml", xml));
    reg.addFile(new MemoryFile("zinc.prog.abap", "MESSAGE e000(zag_unit_test)."));
    reg.addFile(new MemoryFile("zinc.prog.xml", "<SUBC>I</SUBC>"));
    reg.addDependency(new MemoryFile("zdep.prog.abap", "INCLUDE zinc."));
    await reg.parseAsync();
    const issues = new EasyToFindMessages().initialize(reg).run(reg.getObject("MSAG", "ZAG_UNIT_TEST")!);
    expect(issues.length).to.equals(0);
  });

});
