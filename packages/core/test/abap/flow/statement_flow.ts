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
  reg.addFile(new MemoryFile("zstatement_flow.prog.abap", abap));
  await reg.parseAsync();
  const obj = reg.getFirstObject()! as ABAPObject;
  const file = obj.getABAPFiles()[0] as ABAPFile | undefined;
  const stru = file?.getStructure();
  expect(stru).to.not.equal(undefined);
  return new StatementFlow().build(stru!);
}

describe.skip("statement_flow", () => {
  it.only("WRITE", async () => {
    const abap = `WRITE 'hello'.`;
    const res = await build(abap);
    expect(dump(res)).to.equal("[[Write]]");
  });

  it("FORM with two WRITEs", async () => {
    const abap = `
    FORM moo.
      WRITE 'hello'.
      WRITE 'world'.
    ENDFORM.`;
    const res = await build(abap);
    expect(dump(res)).to.equal("[[Form,Write,Write]]");
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

  it("FORM with CHECK", async () => {
    const abap = `
    FORM moo.
      WRITE 'hello'.
      CHECK a = b.
      WRITE 'world'.
    ENDFORM.`;
    const res = await build(abap);
    expect(dump(res)).to.equal("[[Form,Write,Check],[Form,Write,Check,Write]]");
  });

  it("FORM with RETURN", async () => {
    const abap = `
    FORM moo.
      WRITE 'hello'.
      RETURN.
      WRITE 'world'.
    ENDFORM.`;
    const res = await build(abap);
    expect(dump(res)).to.equal("[[Form,Write,Return]]");
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

  it("FORM with IF", async () => {
    const abap = `
    FORM bar.
      IF foo = bar.
        WRITE 'world'.
      ENDIF.
      DATA bar.
    ENDFORM.`;
    const res = await build(abap);
    expect(dump(res)).to.equal("[[Form,If,Write,Data],[Form,If,Data]]");
  });
});