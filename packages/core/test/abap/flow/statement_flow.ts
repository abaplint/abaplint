import {expect} from "chai";
import {ABAPFile} from "../../../src/abap/abap_file";
import {StatementFlow, dumpFlow} from "../../../src/abap/flow/statement_flow";
import {MemoryFile} from "../../../src/files/memory_file";
import {ABAPObject} from "../../../src/objects/_abap_object";
import {Registry} from "../../../src/registry";

async function buildFORM(abap: string) {
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
    const res = await buildFORM(abap);
    expect(dumpFlow(res)).to.equal("[[Write]]");
  });

  it("two WRITEs", async () => {
    const abap = `
    WRITE 'hello'.
    WRITE 'world'.`;
    const res = await buildFORM(abap);
    expect(dumpFlow(res)).to.equal("[[Write,Write]]");
  });

  it("IF", async () => {
    const abap = `
    IF foo = bar.
      WRITE sdfds.
    ENDIF.`;
    const res = await buildFORM(abap);
    expect(dumpFlow(res)).to.equal("[[If,Write],[If]]");
  });

  it("IF, ELSE", async () => {
    const abap = `
    IF foo = bar.
      WRITE sdfds.
    ELSE.
      DATA moo.
    ENDIF.`;
    const res = await buildFORM(abap);
    expect(dumpFlow(res)).to.equal("[[If,Write],[If,Else,Data]]");
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
    const res = await buildFORM(abap);
    expect(dumpFlow(res)).to.equal("[[If,Write],[If,ElseIf,Data],[If,ElseIf,Else,Data]]");
  });

  it("CHECK", async () => {
    const abap = `
    WRITE 'hello'.
    CHECK a = b.
    WRITE 'world'.`;
    const res = await buildFORM(abap);
    expect(dumpFlow(res)).to.equal("[[Write,Check],[Write,Check,Write]]");
  });

  it("RETURN", async () => {
    const abap = `
    WRITE 'hello'.
    RETURN.
    WRITE 'world'.`;
    const res = await buildFORM(abap);
    expect(dumpFlow(res)).to.equal("[[Write,Return]]");
  });

  it("IF with RETURN", async () => {
    const abap = `
    IF foo = bar.
      RETURN.
      WRITE 'world'.
    ENDIF.`;
    const res = await buildFORM(abap);
    expect(dumpFlow(res)).to.equal("[[If,Return],[If]]");
  });

  it("IF", async () => {
    const abap = `
    IF foo = bar.
      WRITE 'world'.
    ENDIF.
    DATA bar.`;
    const res = await buildFORM(abap);
    expect(dumpFlow(res)).to.equal("[[If,Write,Data],[If,Data]]");
  });

  it("LOOP", async () => {
    const abap = `
    LOOP AT bar INTO foo.
      WRITE 'world'.
    ENDLOOP.`;
    const res = await buildFORM(abap);
    expect(dumpFlow(res)).to.equal("[[Loop,Write],[Loop,Write,Write],[Loop]]");
  });

  it("LOOP with nested IF", async () => {
    const abap = `
    LOOP AT bar INTO foo.
      ADD 2 to bar.
      IF 1 = 2.
        WRITE moo.
      ENDIF.
    ENDLOOP.`;
    const res = await buildFORM(abap);
    expect(dumpFlow(res)).to.equal("[[Loop,Add,If,Write],[Loop,Add,If],[Loop,Add,If,Write,Add,If,Write],[Loop,Add,If,Write,Add,If],[Loop,Add,If,Add,If,Write],[Loop,Add,If,Add,If],[Loop]]");
  });

  it("IF, top level EXIT", async () => {
    const abap = `
    IF foo = bar.
      EXIT.
      WRITE sdfds.
    ENDIF.`;
    const res = await buildFORM(abap);
    expect(dumpFlow(res)).to.equal("[[If,Exit],[If]]");
  });

  it("LOOP with nested IF + EXIT", async () => {
    const abap = `
    LOOP AT bar INTO foo.
      IF 1 = 2.
        EXIT.
      ENDIF.
    ENDLOOP.`;
    const res = await buildFORM(abap);
    expect(dumpFlow(res)).to.equal("[[Loop,If,Exit],[Loop,If],[Loop,If,If,Exit],[Loop,If,If],[Loop]]");
  });

  it("LOOP with nested IF + CONTINUE", async () => {
    const abap = `
    LOOP AT bar INTO foo.
      IF 1 = 2.
        CONTINUE.
      ENDIF.
    ENDLOOP.`;
    const res = await buildFORM(abap);
    expect(dumpFlow(res)).to.equal("[[Loop,If,Continue],[Loop,If],[Loop,If,If,Continue],[Loop,If,If],[Loop]]");
  });
});