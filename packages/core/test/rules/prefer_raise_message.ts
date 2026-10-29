import {PreferRaiseMessage, PreferRaiseMessageConf} from "../../src/rules";
import {Issue} from "../../src/issue";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {expect} from "chai";

async function findIssues(abap: string, ignore?: string[]): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  const rule = new PreferRaiseMessage();
  if (ignore) {
    const conf = new PreferRaiseMessageConf();
    conf.ignoreExceptionClasses = ignore;
    rule.setConfig(conf);
  }
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: prefer_raise_message", () => {
  it("parser error", async () => {
    const issues = await findIssues("parser error");
    expect(issues.length).to.equal(0);
  });

  it("text literal, TYPE", async () => {
    const issues = await findIssues(`RAISE EXCEPTION TYPE zcx_error
  EXPORTING text = 'hello world'.`);
    expect(issues.length).to.equal(1);
  });

  it("variable, TYPE", async () => {
    const issues = await findIssues("RAISE EXCEPTION TYPE zcx_error EXPORTING text = lv_text.");
    expect(issues.length).to.equal(1);
  });

  it("among other parameters, upper case", async () => {
    const issues = await findIssues("RAISE EXCEPTION TYPE zcx_error EXPORTING previous = lx_error TEXT = lv_text.");
    expect(issues.length).to.equal(1);
  });

  it("RESUMABLE", async () => {
    const issues = await findIssues("RAISE RESUMABLE EXCEPTION TYPE zcx_error EXPORTING text = 'hello world'.");
    expect(issues.length).to.equal(1);
  });

  it("NEW", async () => {
    const issues = await findIssues("RAISE EXCEPTION NEW zcx_error( text = 'hello world' ).");
    expect(issues.length).to.equal(1);
  });

  it("NEW, single unnamed parameter", async () => {
    const issues = await findIssues("RAISE EXCEPTION NEW zcx_error( 'hello world' ).");
    expect(issues.length).to.equal(0);
  });

  it("no parameters", async () => {
    const issues = await findIssues("RAISE EXCEPTION TYPE zcx_error.");
    expect(issues.length).to.equal(0);
  });

  it("other parameters with text literal", async () => {
    const issues = await findIssues("RAISE EXCEPTION TYPE zcx_error EXPORTING value = 'hello' previous = lx_error.");
    expect(issues.length).to.equal(0);
  });

  it("parameter name containing text", async () => {
    const issues = await findIssues("RAISE EXCEPTION TYPE zcx_error EXPORTING texts = lt_texts.");
    expect(issues.length).to.equal(0);
  });

  it("textid, TYPE", async () => {
    const issues = await findIssues("RAISE EXCEPTION TYPE zcx_error EXPORTING textid = zcx_error=>foo.");
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("TEXTID");
  });

  it("textid, NEW, upper case", async () => {
    const issues = await findIssues("RAISE EXCEPTION NEW zcx_error( TEXTID = zcx_error=>foo ).");
    expect(issues.length).to.equal(1);
  });

  it("textid, with MESSAGE", async () => {
    const issues = await findIssues("RAISE EXCEPTION TYPE zcx_error MESSAGE e001(zclass) EXPORTING textid = zcx_error=>foo.");
    expect(issues.length).to.equal(0);
  });

  it("textid, ignored via configuration", async () => {
    const issues = await findIssues("RAISE EXCEPTION TYPE zcx_error EXPORTING textid = zcx_error=>foo.", ["zcx_error"]);
    expect(issues.length).to.equal(0);
  });

  it("with MESSAGE", async () => {
    const issues = await findIssues("RAISE EXCEPTION TYPE zcx_error MESSAGE e001(zclass) EXPORTING text = 'hello'.");
    expect(issues.length).to.equal(0);
  });

  it("USING MESSAGE", async () => {
    const issues = await findIssues("RAISE EXCEPTION TYPE zcx_error USING MESSAGE.");
    expect(issues.length).to.equal(0);
  });

  it("classic exception", async () => {
    const issues = await findIssues("RAISE not_found.");
    expect(issues.length).to.equal(0);
  });

  it("ignored via configuration, TYPE", async () => {
    const issues = await findIssues("RAISE EXCEPTION TYPE zcx_error EXPORTING text = 'hello world'.", ["ZCX_ERROR"]);
    expect(issues.length).to.equal(0);
  });

  it("ignored via configuration, NEW, case insensitive", async () => {
    const issues = await findIssues("RAISE EXCEPTION NEW zcx_error( text = 'hello world' ).", ["zcx_Error"]);
    expect(issues.length).to.equal(0);
  });

  it("not in ignore list", async () => {
    const issues = await findIssues("RAISE EXCEPTION TYPE zcx_other EXPORTING text = 'hello world'.", ["zcx_error"]);
    expect(issues.length).to.equal(1);
  });
});
