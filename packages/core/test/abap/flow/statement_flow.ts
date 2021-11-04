import {expect} from "chai";
import {ABAPFile} from "../../../src/abap/abap_file";
import {StatementFlow, dumpFlows} from "../../../src/abap/flow/statement_flow";
import {StatementFlow2} from "../../../src/abap/flow/statement_flow2";
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

async function buildFORM2(abap: string) {
  const reg = new Registry();
  reg.addFile(new MemoryFile("zstatement_flow.prog.abap", "FORM moo.\n" + abap + "\nENDFORM.\n"));
  await reg.parseAsync();
  const issues = reg.findIssues().filter(i => i.getKey() === "parser_error");
  expect(issues[0]?.getMessage()).to.equal(undefined);
  const obj = reg.getFirstObject()! as ABAPObject;
  const file = obj.getABAPFiles()[0] as ABAPFile | undefined;
  const stru = file?.getStructure();
  expect(stru).to.not.equal(undefined);
  return new StatementFlow2().build(stru!);
}

describe("statement_flow", () => {
  it("WRITE", async () => {
    const abap = `WRITE 'hello'.`;
    const res = await buildFORM(abap);
    expect(dumpFlows(res)).to.equal("[[Write]]");
  });

  it("two WRITEs", async () => {
    const abap = `
    WRITE 'hello'.
    WRITE 'world'.`;
    const res = await buildFORM(abap);
    expect(dumpFlows(res)).to.equal("[[Write,Write]]");

    const res2 = await buildFORM2(abap);
    expect(res2[0].toDigraph()).to.equal(`"start#1" -> "Write:3,5";
"Write:3,5" -> "Write:4,5";
"Write:4,5" -> "end#1";`);
  });

  it("IF", async () => {
    const abap = `
    IF foo = bar.
      WRITE sdfds.
    ENDIF.`;
    const res = await buildFORM(abap);
    expect(dumpFlows(res)).to.equal("[[If,Write],[If]]");

    const res2 = await buildFORM2(abap);
    expect(res2[0].toDigraph()).to.equal(`"If:3,5" -> "Write:4,7";
"If:3,5" -> "end#1";
"start#1" -> "If:3,5";
"Write:4,7" -> "end#1";`);
  });

  it("IF, ELSE", async () => {
    const abap = `
    IF foo = bar.
      WRITE sdfds.
    ELSE.
      DATA moo.
    ENDIF.`;
    const res = await buildFORM(abap);
    expect(dumpFlows(res)).to.equal("[[If,Write],[If,Else,Data]]");

    const res2 = await buildFORM2(abap);
    expect(res2[0].toDigraph()).to.equal(`"If:3,5" -> "Else:5,5";
"If:3,5" -> "Write:4,7";
"start#1" -> "If:3,5";
"Write:4,7" -> "end#1";
"Else:5,5" -> "Data:6,7";
"Data:6,7" -> "end#1";`);
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
    expect(dumpFlows(res)).to.equal("[[If,Write],[If,ElseIf,Data],[If,ElseIf,Else,Data]]");

    const res2 = await buildFORM2(abap);
    expect(res2[0].toDigraph()).to.equal(`"If:3,5" -> "ElseIf:5,5";
"If:3,5" -> "Write:4,7";
"ElseIf:5,5" -> "Else:7,5";
"ElseIf:5,5" -> "Data:6,7";
"start#1" -> "If:3,5";
"Write:4,7" -> "end#1";
"Data:6,7" -> "end#1";
"Else:7,5" -> "Data:8,7";
"Data:8,7" -> "end#1";`);
  });

  it("CHECK", async () => {
    const abap = `
    WRITE 'hello'.
    CHECK a = b.
    WRITE 'world'.`;
    const res = await buildFORM(abap);
    expect(dumpFlows(res)).to.equal("[[Write,Check],[Write,Check,Write]]");

    const res2 = await buildFORM2(abap);
    expect(res2[0].toDigraph()).to.equal(`"start#1" -> "Write:3,5";
"Write:3,5" -> "Check:4,5";
"Check:4,5" -> "end#1";
"Check:4,5" -> "Write:5,5";
"Write:5,5" -> "end#1";`);
  });

  it("ASSERT", async () => {
    const abap = `
    WRITE 'hello'.
    ASSERT a = b.
    WRITE 'world'.`;
    const res = await buildFORM(abap);
    expect(dumpFlows(res)).to.equal("[[Write,Assert],[Write,Assert,Write]]");

    const res2 = await buildFORM2(abap);
    expect(res2[0].toDigraph()).to.equal(`"start#1" -> "Write:3,5";
"Write:3,5" -> "Assert:4,5";
"Assert:4,5" -> "end#1";
"Assert:4,5" -> "Write:5,5";
"Write:5,5" -> "end#1";`);
  });

  it("RETURN", async () => {
    const abap = `
    WRITE 'hello'.
    RETURN.
    WRITE 'world'.`;
    const res = await buildFORM(abap);
    expect(dumpFlows(res)).to.equal("[[Write,Return]]");

    const res2 = await buildFORM2(abap);
    expect(res2[0].toDigraph()).to.equal(`"start#1" -> "Write:3,5";
"Write:3,5" -> "Return:4,5";
"Return:4,5" -> "end#1";`);
  });

  it("IF with RETURN", async () => {
    const abap = `
    IF foo = bar.
      RETURN.
      WRITE 'world'.
    ENDIF.`;
    const res = await buildFORM(abap);
    expect(dumpFlows(res)).to.equal("[[If,Return],[If]]");

    const res2 = await buildFORM2(abap);
    expect(res2[0].toDigraph()).to.equal(`"If:3,5" -> "Return:4,7";
"If:3,5" -> "end#1";
"Return:4,7" -> "end#1";
"start#1" -> "If:3,5";`);
  });

  it("IF", async () => {
    const abap = `
    IF foo = bar.
      WRITE 'world'.
    ENDIF.
    DATA bar.`;
    const res = await buildFORM(abap);
    expect(dumpFlows(res)).to.equal("[[If,Write,Data],[If,Data]]");

    const res2 = await buildFORM2(abap);
    expect(res2[0].toDigraph()).to.equal(`"If:3,5" -> "Write:4,7";
"If:3,5" -> "Data:6,5";
"Data:6,5" -> "end#1";
"start#1" -> "If:3,5";
"Write:4,7" -> "Data:6,5";`);
  });

  it("LOOP", async () => {
    const abap = `
    LOOP AT bar INTO foo.
      WRITE 'world'.
    ENDLOOP.`;
    const res = await buildFORM(abap);
    expect(dumpFlows(res)).to.equal("[[Loop,Write],[Loop,Write,Write],[Loop]]");

    const res2 = await buildFORM2(abap);
    expect(res2[0].toDigraph()).to.equal(`"Loop:3,5" -> "Write:4,7";
"Loop:3,5" -> "end#1";
"start#1" -> "Loop:3,5";
"Write:4,7" -> "Loop:3,5";`);
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
    expect(dumpFlows(res)).to.equal("[[Loop,Add,If,Write],[Loop,Add,If],[Loop,Add,If,Write,Add,If,Write],[Loop,Add,If,Write,Add,If],[Loop,Add,If,Add,If,Write],[Loop,Add,If,Add,If],[Loop]]");

    const res2 = await buildFORM2(abap);
    expect(res2[0].toDigraph()).to.equal(`"Loop:3,5" -> "Add:4,7";
"Loop:3,5" -> "end#1";
"If:5,7" -> "Write:6,9";
"If:5,7" -> "Loop:3,5";
"start#1" -> "Loop:3,5";
"Add:4,7" -> "If:5,7";
"Write:6,9" -> "Loop:3,5";`);
  });

  it("IF, top level EXIT", async () => {
    const abap = `
    IF foo = bar.
      EXIT.
      WRITE sdfds.
    ENDIF.`;
    const res = await buildFORM(abap);
    expect(dumpFlows(res)).to.equal("[[If,Exit],[If]]");

    const res2 = await buildFORM2(abap);
    expect(res2[0].toDigraph()).to.equal(`"If:3,5" -> "Exit:4,7";
"If:3,5" -> "end#1";
"Exit:4,7" -> "end#1";
"start#1" -> "If:3,5";`);
  });

  it("IF and top level RETURN", async () => {
    const abap = `
    IF foo = bar.
      RETURN.
      WRITE sdfds.
    ENDIF.`;
    const res = await buildFORM(abap);
    expect(dumpFlows(res)).to.equal("[[If,Return],[If]]");
/*
    const res2 = await buildFORM2(abap);
    expect(res2[0].toDigraph()).to.equal(`sdfds`);
*/
  });

  it("top level RETURN", async () => {
    const abap = `
      RETURN.
      WRITE sdfds.`;
    const res = await buildFORM(abap);
    expect(dumpFlows(res)).to.equal("[[Return]]");
/*
    const res2 = await buildFORM2(abap);
    expect(res2[0].toDigraph()).to.equal(`sdfds`);
*/
  });

  it("LOOP with nested IF + EXIT", async () => {
    const abap = `
    LOOP AT bar INTO foo.
      IF 1 = 2.
        EXIT.
      ENDIF.
    ENDLOOP.`;
    const res = await buildFORM(abap);
    expect(dumpFlows(res)).to.equal("[[Loop,If,Exit],[Loop,If],[Loop,If,If,Exit],[Loop,If,If],[Loop]]");
/*
    const res2 = await buildFORM2(abap);
    expect(res2[0].toDigraph()).to.equal(`sdfds`);
*/
  });

  it("LOOP with nested IF + CONTINUE", async () => {
    const abap = `
    LOOP AT bar INTO foo.
      IF 1 = 2.
        CONTINUE.
      ENDIF.
    ENDLOOP.`;
    const res = await buildFORM(abap);
    expect(dumpFlows(res)).to.equal("[[Loop,If,Continue],[Loop,If],[Loop,If,If,Continue],[Loop,If,If],[Loop]]");
/*
    const res2 = await buildFORM2(abap);
    expect(res2[0].toDigraph()).to.equal(`sdfds`);
*/
  });

  it("LOOP with nested IF + RETURN", async () => {
    const abap = `
    LOOP AT bar INTO foo.
      IF 1 = 2.
        RETURN.
      ENDIF.
    ENDLOOP.`;
    const res = await buildFORM(abap);
    expect(dumpFlows(res)).to.equal("[[Loop,If,Return],[Loop,If],[Loop,If,If,Return],[Loop,If,If],[Loop]]");
/*
    const res2 = await buildFORM2(abap);
    expect(res2[0].toDigraph()).to.equal(`sdfds`);
*/
  });

  it("Basic DO", async () => {
    const abap = `
    DO 200 TIMES.
      WRITE moo.
    ENDDO.`;
    const res = await buildFORM(abap);
    expect(dumpFlows(res)).to.equal("[[Do,Write],[Do,Write,Write],[Do]]");
/*
    const res2 = await buildFORM2(abap);
    expect(res2[0].toDigraph()).to.equal(`sdfds`);
*/
  });

  it("Basic WHILE", async () => {
    const abap = `
    WHILE foo = bar.
      WRITE moo.
    ENDWHILE.`;
    const res = await buildFORM(abap);
    expect(dumpFlows(res)).to.equal("[[While,Write],[While,Write,Write],[While]]");
/*
    const res2 = await buildFORM2(abap);
    expect(res2[0].toDigraph()).to.equal(`sdfds`);
*/
  });

  it("Basic SELECT loop", async () => {
    const abap = `
    SELECT foo FROM bar INTO moo.
      WRITE moo.
    ENDSELECT.`;
    const res = await buildFORM(abap);
    expect(dumpFlows(res)).to.equal("[[SelectLoop,Write],[SelectLoop,Write,Write],[SelectLoop]]");
/*
    const res2 = await buildFORM2(abap);
    expect(res2[0].toDigraph()).to.equal(`sdfds`);
*/
  });

  it("Basic CASE loop", async () => {
    const abap = `
CASE foobar.
  WHEN 1.
    WRITE 'hello'.
  WHEN 2.
    foo = bar.
  WHEN OTHERS.
    call( ).
ENDCASE.`;
    const res = await buildFORM(abap);
    expect(dumpFlows(res)).to.equal("[[Case,When,Write],[Case,When,Move],[Case,WhenOthers,Call]]");
/*
    const res2 = await buildFORM2(abap);
    expect(res2[0].toDigraph()).to.equal(`sdfds`);
*/
  });

  it("CASE without OTHERS", async () => {
    const abap = `
CASE foobar.
  WHEN 1.
    WRITE 'hello'.
  WHEN 2.
    foo = bar.
ENDCASE.`;
    const res = await buildFORM(abap);
    expect(dumpFlows(res)).to.equal("[[Case,When,Write],[Case,When,Move],[Case]]");
/*
    const res2 = await buildFORM2(abap);
    expect(res2[0].toDigraph()).to.equal(`sdfds`);
*/
  });

  it("Basic TRY-CATCH", async () => {
    const abap = `
TRY.
  WRITE boo.
  call( ).
CATCH foobar.
  foo = 2.
ENDTRY.`;
    const res = await buildFORM(abap);
    expect(dumpFlows(res)).to.equal("[[Try,Write,Call],[Try,Write,Call,Catch,Move]]");
/*
    const res2 = await buildFORM2(abap);
    expect(res2[0].toDigraph()).to.equal(`sdfds`);
*/
  });

  it("empty TRY-CATCH", async () => {
    const abap = `
TRY.
ENDTRY.`;
    const res = await buildFORM(abap);
    expect(dumpFlows(res)).to.equal("[[Try]]");
/*
    const res2 = await buildFORM2(abap);
    expect(res2[0].toDigraph()).to.equal(`sdfds`);
*/
  });

  it("empty TRY-CATCH", async () => {
    const abap = `
TRY.
CATCH foobar.
ENDTRY.`;
    const res = await buildFORM(abap);
    expect(dumpFlows(res)).to.equal("[[Try],[Try,Catch]]");
/*
    const res2 = await buildFORM2(abap);
    expect(res2[0].toDigraph()).to.equal(`sdfds`);
*/
  });

});