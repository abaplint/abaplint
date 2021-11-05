import {expect} from "chai";
import {ABAPFile} from "../../../src/abap/abap_file";
import {StatementFlow} from "../../../src/abap/flow/statement_flow";
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

    const res2 = await buildFORM(abap);
    expect(res2[0].toTextEdges()).to.equal(`"start#1" -> "Write:2,1";
"Write:2,1" -> "end#1";`);
  });

  it("two WRITEs", async () => {
    const abap = `
    WRITE 'hello'.
    WRITE 'world'.`;

    const res2 = await buildFORM(abap);
    expect(res2[0].toTextEdges()).to.equal(`"start#1" -> "Write:3,5";
"Write:3,5" -> "Write:4,5";
"Write:4,5" -> "end#1";`);
  });

  it("IF", async () => {
    const abap = `
    IF foo = bar.
      WRITE sdfds.
    ENDIF.`;

    const res2 = await buildFORM(abap);
    expect(res2[0].toTextEdges()).to.equal(`"If:3,5" -> "Write:4,7";
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

    const res2 = await buildFORM(abap);
    expect(res2[0].toTextEdges()).to.equal(`"If:3,5" -> "Else:5,5";
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

    const res2 = await buildFORM(abap);
    expect(res2[0].toTextEdges()).to.equal(`"If:3,5" -> "ElseIf:5,5";
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

    const res2 = await buildFORM(abap);
    expect(res2[0].toTextEdges()).to.equal(`"start#1" -> "Write:3,5";
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

    const res2 = await buildFORM(abap);
    expect(res2[0].toTextEdges()).to.equal(`"start#1" -> "Write:3,5";
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

    const res2 = await buildFORM(abap);
    expect(res2[0].toTextEdges()).to.equal(`"start#1" -> "Write:3,5";
"Write:3,5" -> "Return:4,5";
"Return:4,5" -> "end#1";`);
  });

  it("IF with RETURN", async () => {
    const abap = `
    IF foo = bar.
      RETURN.
      WRITE 'world'.
    ENDIF.`;

    const res2 = await buildFORM(abap);
    expect(res2[0].toTextEdges()).to.equal(`"If:3,5" -> "Return:4,7";
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

    const res2 = await buildFORM(abap);
    expect(res2[0].toTextEdges()).to.equal(`"If:3,5" -> "Write:4,7";
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

    const res2 = await buildFORM(abap);
    expect(res2[0].toTextEdges()).to.equal(`"Loop:3,5" -> "Write:4,7";
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

    const res2 = await buildFORM(abap);
    expect(res2[0].toTextEdges()).to.equal(`"Loop:3,5" -> "Add:4,7";
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

    const res2 = await buildFORM(abap);
    expect(res2[0].toTextEdges()).to.equal(`"If:3,5" -> "Exit:4,7";
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

    const res2 = await buildFORM(abap);
    expect(res2[0].toTextEdges()).to.equal(`"If:3,5" -> "Return:4,7";
"If:3,5" -> "end#1";
"Return:4,7" -> "end#1";
"start#1" -> "If:3,5";`);
  });

  it("top level RETURN", async () => {
    const abap = `
      RETURN.
      WRITE sdfds.`;

    const res2 = await buildFORM(abap);
    expect(res2[0].toTextEdges()).to.equal(`"start#1" -> "Return:3,7";
"Return:3,7" -> "end#1";`);
  });

  it("LOOP with nested IF + EXIT", async () => {
    const abap = `
    LOOP AT bar INTO foo.
      IF 1 = 2.
        EXIT.
      ENDIF.
    ENDLOOP.`;

    const res2 = await buildFORM(abap);
    expect(res2[0].toTextEdges()).to.equal(`"Loop:3,5" -> "end#1";
"Loop:3,5" -> "If:4,7";
"If:4,7" -> "Exit:5,9";
"If:4,7" -> "Loop:3,5";
"Exit:5,9" -> "Loop:3,5";
"start#1" -> "Loop:3,5";`);
  });

  it("LOOP with nested IF + CONTINUE", async () => {
    const abap = `
    LOOP AT bar INTO foo.
      IF 1 = 2.
        CONTINUE.
      ENDIF.
    ENDLOOP.`;

    const res2 = await buildFORM(abap);
    expect(res2[0].toTextEdges()).to.equal(`"Loop:3,5" -> "end#1";
"Loop:3,5" -> "If:4,7";
"If:4,7" -> "Continue:5,9";
"If:4,7" -> "Loop:3,5";
"Continue:5,9" -> "Loop:3,5";
"start#1" -> "Loop:3,5";`);
  });

  it("LOOP with nested IF + RETURN", async () => {
    const abap = `
    LOOP AT bar INTO foo.
      IF 1 = 2.
        RETURN.
      ENDIF.
    ENDLOOP.`;

    const res2 = await buildFORM(abap);
    expect(res2[0].toTextEdges()).to.equal(`"Loop:3,5" -> "end#1";
"Loop:3,5" -> "If:4,7";
"If:4,7" -> "Return:5,9";
"If:4,7" -> "Loop:3,5";
"Return:5,9" -> "end#1";
"start#1" -> "Loop:3,5";`);
  });

  it("Basic DO", async () => {
    const abap = `
    DO 200 TIMES.
      WRITE moo.
    ENDDO.`;

    const res2 = await buildFORM(abap);
    expect(res2[0].toTextEdges()).to.equal(`"Do:3,5" -> "Write:4,7";
"Do:3,5" -> "end#1";
"start#1" -> "Do:3,5";
"Write:4,7" -> "Do:3,5";`);
  });

  it("Basic WHILE", async () => {
    const abap = `
    WHILE foo = bar.
      WRITE moo.
    ENDWHILE.`;

    const res2 = await buildFORM(abap);
    expect(res2[0].toTextEdges()).to.equal(`"While:3,5" -> "Write:4,7";
"While:3,5" -> "end#1";
"start#1" -> "While:3,5";
"Write:4,7" -> "While:3,5";`);
  });

  it("Basic SELECT loop", async () => {
    const abap = `
    SELECT foo FROM bar INTO moo.
      WRITE moo.
    ENDSELECT.`;

    const res2 = await buildFORM(abap);
    expect(res2[0].toTextEdges()).to.equal(`"SelectLoop:3,5" -> "Write:4,7";
"SelectLoop:3,5" -> "end#1";
"start#1" -> "SelectLoop:3,5";
"Write:4,7" -> "SelectLoop:3,5";`);
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

    const res2 = await buildFORM(abap);
    expect(res2[0].toTextEdges()).to.equal(`"Case:3,1" -> "When:4,3";
"Case:3,1" -> "When:6,3";
"Case:3,1" -> "WhenOthers:8,3";
"start#1" -> "Case:3,1";
"When:4,3" -> "Write:5,5";
"Write:5,5" -> "end#1";
"When:6,3" -> "Move:7,5";
"Move:7,5" -> "end#1";
"WhenOthers:8,3" -> "Call:9,5";
"Call:9,5" -> "end#1";`);
  });

  it("CASE without OTHERS", async () => {
    const abap = `
CASE foobar.
  WHEN 1.
    WRITE 'hello'.
  WHEN 2.
    foo = bar.
ENDCASE.`;

    const res2 = await buildFORM(abap);
    expect(res2[0].toTextEdges()).to.equal(`"Case:3,1" -> "When:4,3";
"Case:3,1" -> "When:6,3";
"Case:3,1" -> "end#1";
"start#1" -> "Case:3,1";
"When:4,3" -> "Write:5,5";
"Write:5,5" -> "end#1";
"When:6,3" -> "Move:7,5";
"Move:7,5" -> "end#1";`);
  });

  it("Basic TRY-CATCH", async () => {
    const abap = `
TRY.
  WRITE boo.
  call( ).
CATCH foobar.
  foo = 2.
ENDTRY.`;

    const res2 = await buildFORM(abap);
    expect(res2[0].toTextEdges()).to.equal(`"Write:4,3" -> "Call:5,3";
"start#1" -> "Try:3,1";
"Try:3,1" -> "Write:4,3";
"Call:5,3" -> "Catch:6,1";
"Call:5,3" -> "end#1";
"Catch:6,1" -> "Move:7,3";
"Move:7,3" -> "end#1";`);
  });

  it("empty TRY-CATCH", async () => {
    const abap = `
TRY.
ENDTRY.`;

    const res2 = await buildFORM(abap);
    expect(res2[0].toTextEdges()).to.equal(`"start#1" -> "Try:3,1";
"Try:3,1" -> "end#1";`);
  });

  it("empty TRY-CATCH", async () => {
    const abap = `
TRY.
CATCH foobar.
ENDTRY.`;

    const res2 = await buildFORM(abap);
    expect(res2[0].toTextEdges()).to.equal(`"start#1" -> "Try:3,1";
"Try:3,1" -> "Catch:4,1";
"Try:3,1" -> "end#1";
"Catch:4,1" -> "end#1";`);
  });

  it("LOOP with EXIT", async () => {
    const abap = `
    LOOP AT bar INTO foo.
      EXIT.
      DATA foo TYPE i.
    ENDLOOP.
    WRITE bar.`;

    const res2 = await buildFORM(abap);
    expect(res2[0].toTextEdges()).to.equal(`"Loop:3,5" -> "Exit:4,7";
"Loop:3,5" -> "Write:7,5";
"Exit:4,7" -> "Loop:3,5";
"Write:7,5" -> "end#1";
"start#1" -> "Loop:3,5";`);
  });

  it("LOOP with CONTINUE", async () => {
    const abap = `
    LOOP AT bar INTO foo.
      CONTINUE.
      DATA foo TYPE i.
    ENDLOOP.
    WRITE bar.`;

    const res2 = await buildFORM(abap);
    expect(res2[0].toTextEdges()).to.equal(`"Loop:3,5" -> "Continue:4,7";
"Loop:3,5" -> "Write:7,5";
"Continue:4,7" -> "Loop:3,5";
"Write:7,5" -> "end#1";
"start#1" -> "Loop:3,5";`);
  });

  it("Chained statement", async () => {
    const abap = `
    DATA: foo, bar.`;

    const res2 = await buildFORM(abap);
    expect(res2[0].toTextEdges()).to.equal(`"start#1" -> "Data:3,11";
"Data:3,11" -> "Data:3,16";
"Data:3,16" -> "end#1";`);
  });

});