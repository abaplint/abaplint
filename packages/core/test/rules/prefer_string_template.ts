import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {PreferStringTemplate} from "../../src/rules";
import {Issue} from "../../src/issue";
import {testRuleFix} from "./_utils";

async function run(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zfoobar.prog.abap", abap));
  await reg.parseAsync();
  return new PreferStringTemplate().initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: prefer_string_template", () => {

  it("ok, no &&", async () => {
    const abap = `DATA(text) = lv_a.`;
    const issues = await run(abap);
    expect(issues.length).to.equal(0);
  });

  it("ok, parser error", async () => {
    const abap = `parser error`;
    const issues = await run(abap);
    expect(issues.length).to.equal(0);
  });

  it("ok, two variables with &&, no literal", async () => {
    const abap = `DATA(text) = lv_a && lv_b.`;
    const issues = await run(abap);
    expect(issues.length).to.equal(0);
  });

  it("bad, string literal && variable", async () => {
    const abap = "DATA(text) = 'prefix: ' && lv_var.";
    const issues = await run(abap);
    expect(issues.length).to.equal(1);
  });

  it("bad, variable && string literal", async () => {
    const abap = "DATA(text) = lv_var && ' suffix'.";
    const issues = await run(abap);
    expect(issues.length).to.equal(1);
  });

  it("bad, two string literals", async () => {
    const abap = "DATA(text) = 'hello ' && 'world'.";
    const issues = await run(abap);
    expect(issues.length).to.equal(1);
  });

  it("bad, backtick literal && variable", async () => {
    const abap = "DATA(text) = `prefix: ` && lv_var.";
    const issues = await run(abap);
    expect(issues.length).to.equal(1);
  });

  it("bad, chain: literal && variable && literal", async () => {
    const abap = "DATA(message) = `Received HTTP ` && status_code && ` with message ` && text.";
    const issues = await run(abap);
    expect(issues.length).to.equal(1);
  });

});

testRuleFix([
  {
    input: "DATA(text) = 'prefix: ' && lv_var.",
    output: "DATA(text) = |prefix: { lv_var }|.",
  },
  {
    input: "DATA(text) = lv_var && ' suffix'.",
    output: "DATA(text) = |{ lv_var } suffix|.",
  },
  {
    input: "DATA(text) = 'hello ' && 'world'.",
    output: "DATA(text) = |hello world|.",
  },
  {
    input: "DATA(text) = `prefix: ` && lv_var.",
    output: "DATA(text) = |prefix: { lv_var }|.",
  },
  {
    input: "DATA(message) = `Received HTTP ` && status_code && ` with message ` && text.",
    output: "DATA(message) = |Received HTTP { status_code } with message { text }|.",
  },
], PreferStringTemplate);
