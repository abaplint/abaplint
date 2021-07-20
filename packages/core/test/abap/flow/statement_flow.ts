import {expect} from "chai";
import {ABAPFile} from "../../../src/abap/abap_file";
import {StatementFlow, StatementFlowPath} from "../../../src/abap/flow/statement_flow";
import {MemoryFile} from "../../../src/files/memory_file";
import {ABAPObject} from "../../../src/objects/_abap_object";
import {Registry} from "../../../src/registry";

function dump(flows: StatementFlowPath[]): string {
  const ret = "[" + flows.map(f => "[" + f.statements.map(b => b?.get().constructor.name).join(",") + "]").join(",");
  return ret + "]";
}

async function build(abap: string) {
  const reg = new Registry();
  reg.addFile(new MemoryFile("zstatement_flow.prog.abap", "FORM moo.\n" + abap + "\nENDFORM.\n"));
  await reg.parseAsync();
  const issues = reg.findIssues().filter(i => i.getKey() === "parser_error");
  expect(issues[0]?.getMessage()).to.equal(undefined);
  const obj = reg.getFirstObject()! as ABAPObject;
  const file = obj.getABAPFiles()[0] as ABAPFile | undefined;
  const stru = file?.getStructure();
  expect(stru).to.not.equal(undefined);
  return new StatementFlow().build(stru!);
}

describe("statement_flow", () => {
  it("WRITE", async () => {
    const abap = `WRITE 'hello'.`;
    const res = await build(abap);
    expect(dump(res)).to.equal("[[Write]]");
  });

  it("two WRITEs", async () => {
    const abap = `
    WRITE 'hello'.
    WRITE 'world'.`;
    const res = await build(abap);
    expect(dump(res)).to.equal("[[Write,Write]]");
  });

  it("IF", async () => {
    const abap = `
    IF foo = bar.
      WRITE sdfds.
    ENDIF.`;
    const res = await build(abap);
    expect(dump(res)).to.equal("[[If,Write],[If]]");
  });

  it("IF, ELSE", async () => {
    const abap = `
    IF foo = bar.
      WRITE sdfds.
    ELSE.
      DATA moo.
    ENDIF.`;
    const res = await build(abap);
    expect(dump(res)).to.equal("[[If,Write],[If,Else,Data]]");
  });

  it("IF, ELSEIF, ELSE", async () => {
    const abap = `
    IF foo = bar.
      WRITE sdfds.
    ELSEIF moo = boo.
      DATA moo.
    ELSE.
      DATA moo.
    ENDIF.`;
    const res = await build(abap);
    expect(dump(res)).to.equal("[[If,Write],[If,ElseIf,Data],[If,ElseIf,Else,Data]]");
  });

  it("CHECK", async () => {
    const abap = `
    WRITE 'hello'.
    CHECK a = b.
    WRITE 'world'.`;
    const res = await build(abap);
    expect(dump(res)).to.equal("[[Write,Check],[Write,Check,Write]]");
  });

  it("RETURN", async () => {
    const abap = `
    WRITE 'hello'.
    RETURN.
    WRITE 'world'.`;
    const res = await build(abap);
    expect(dump(res)).to.equal("[[Write,Return]]");
  });

  it("IF with RETURN", async () => {
    const abap = `
    IF foo = bar.
      RETURN.
      WRITE 'world'.
    ENDIF.`;
    const res = await build(abap);
    expect(dump(res)).to.equal("[[If,Return],[If]]");
  });

  it("IF", async () => {
    const abap = `
    IF foo = bar.
      WRITE 'world'.
    ENDIF.
    DATA bar.`;
    const res = await build(abap);
    expect(dump(res)).to.equal("[[If,Write,Data],[If,Data]]");
  });

  it("LOOP", async () => {
    const abap = `
    LOOP AT bar INTO foo.
      WRITE 'world'.
    ENDLOOP.`;
    const res = await build(abap);
    expect(dump(res)).to.equal("[[Loop,Write],[Loop,Write,Write],[Loop]]");
  });

  it("LOOP with nested IF", async () => {
    const abap = `
    LOOP AT bar INTO foo.
      ADD 2 to bar.
      IF 1 = 2.
        WRITE moo.
      ENDIF.
    ENDLOOP.`;
    const res = await build(abap);
    expect(dump(res)).to.equal("[[Loop,Add,If,Write],[Loop,Add,If],[Loop,Add,If,Write,Add,If,Write],[Loop,Add,If,Write,Add,If],[Loop,Add,If,Add,If,Write],[Loop,Add,If,Add,If],[Loop]]");
  });
});