import {expect} from "chai";
import {MemoryFile, Registry} from "../../src";
import * as Expressions from "../../src/abap/2_statements/expressions";
import * as Statements from "../../src/abap/2_statements/statements";
import {Hierarchy, ObjectAnalysis, OccurrenceKind, Procedure, expressionType, formalParameter,
  passedByValue} from "../../src/rules/_procedure_analysis";
import {inMethod} from "./_redundant_code";

function analyze(abap: string): Procedure {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap)).parse();
  const analysis = ObjectAnalysis.run(reg, reg.getFirstObject()!);
  expect(analysis).to.not.equal(undefined);
  return analysis!.procedures.find(p => p.statements[0].concatTokens().toUpperCase() === "METHOD RUN.")!;
}

/** kinds of the references of local x, in source order */
function kinds(body: string): string[] {
  const procedure = analyze(inMethod(body));
  const x = procedure.locals().find(v => v.identifier.getName() === "x");
  expect(x, body).to.not.equal(undefined);
  return x!.occurrences.map(o => o.kind);
}

describe("procedure analysis, occurrence kinds", () => {
  const read = OccurrenceKind.Read;
  const write = OccurrenceKind.Write;
  const escape = OccurrenceKind.Escape;
  const cases: [string, string[]][] = [
    ["DATA x TYPE i.\nx = 1.\nattr = x.", [write, read]],
    ["DATA x TYPE i.\nCLEAR x.\nFREE x.\nADD 1 TO x.\nx += 1.", [write, write, write, write]],
    ["DATA x TYPE i.\nch( CHANGING c = x ).", [write]],
    ["DATA x TYPE i.\nex( IMPORTING e = x ).", [write]],
    ["DATA x TYPE i.\nattr = get( p = x ).\nput( p = x ).", [read, read]],
    ["DATA x TYPE i.\nGET REFERENCE OF x INTO DATA(dref).", [escape]],
    ["DATA x TYPE i.\nDATA(dref) = REF #( x ).", [escape]],
    ["DATA x TYPE i.\nASSIGN x TO FIELD-SYMBOL(<fs>).", [escape]],
    ["DATA x TYPE i.\nPERFORM frm USING x.", [escape]],
    ["DATA x TYPE i.\nDATA y LIKE x.", [escape]],
    ["DATA x TYPE STANDARD TABLE OF i WITH DEFAULT KEY.\nLOOP AT x ASSIGNING FIELD-SYMBOL(<fs>).\nENDLOOP.", [escape]],
    ["DATA x TYPE STANDARD TABLE OF i WITH DEFAULT KEY.\nREAD TABLE x INDEX 1 REFERENCE INTO DATA(dref).", [escape]],
    ["DATA x TYPE STANDARD TABLE OF i WITH DEFAULT KEY.\nLOOP AT x INTO DATA(row).\nENDLOOP.", [read]],
    ["DATA x TYPE STANDARD TABLE OF i WITH DEFAULT KEY.\nAPPEND 1 TO x.\nSORT x.", [write, write]],
    // the reference itself is only read when it is dereferenced
    ["DATA x TYPE REF TO lcl.\nx->attr = 2.\nAPPEND 1 TO x->tab.\nCREATE OBJECT x->ref.\nx->put( ).", [read, read, read, read]],
    ["DATA x TYPE REF TO lcl.\nASSIGN x->attr TO FIELD-SYMBOL(<fs>).", [read]],
    ["DATA x TYPE REF TO lcl.\nCREATE OBJECT x.\nIF x IS BOUND.\nENDIF.", [write, read]],
    ["DATA x TYPE string.\nattr = strlen( |{ x }| ).", [read]],
  ];
  for (const [body, expected] of cases) {
    it(body, () => {
      expect(kinds(body)).to.deep.equal(expected);
    });
  }
});

describe("procedure analysis, structure", () => {
  it("chained statements", () => {
    const procedure = analyze(inMethod("DATA: a TYPE i, x TYPE i.\nCLEAR: a, x.\nattr = x."));
    const x = procedure.locals().find(v => v.identifier.getName() === "x")!;
    expect(x.occurrences.map(o => o.statement.concatTokens())).to.deep.equal(["CLEAR x.", "attr = x."]);
  });

  it("locals, parameters and attributes", () => {
    const procedure = analyze(inMethod("DATA x TYPE i.\nDATA(y) = imp.\nx = attr + y.\nresult = x."));
    expect(procedure.locals().map(v => v.identifier.getName())).to.deep.equal(["x", "y"]);
  });

  it("variable named like a parameter name is incomplete", () => {
    const procedure = analyze(inMethod("DATA p TYPE i.\nattr = get( p = p )."));
    expect(procedure.locals().length).to.equal(0);
  });

  it("dominance and loops", () => {
    const procedure = analyze(inMethod(`DATA(x) = 1.
IF attr = 1.
  attr = x.
ENDIF.
DO 2 TIMES.
  attr = x.
ENDDO.
TRY.
    attr = x.
  CATCH cx_root.
    RETRY.
ENDTRY.`));
    const s = procedure.statements;
    const find = (text: string, n = 0) => s.filter(x => x.concatTokens() === text)[n];
    const declaration = find("DATA(x) = 1.");
    expect(procedure.dominates(declaration, find("attr = x.", 0))).to.equal(true);
    expect(procedure.sameLoop(declaration, find("attr = x.", 0))).to.equal(true);
    expect(procedure.sameLoop(declaration, find("attr = x.", 1))).to.equal(false);
    expect(procedure.sameLoop(declaration, find("attr = x.", 2))).to.equal(false);
    expect(procedure.dominates(find("attr = x.", 0), find("attr = x.", 1))).to.equal(false);
    expect(procedure.straightBetween(declaration, find("IF attr = 1."))).to.deep.equal([]);
    expect(procedure.straightBetween(declaration, find("DO 2 TIMES."))).to.equal(undefined);
  });

  it("dynamic code makes the procedure unsupported", () => {
    const procedure = analyze(inMethod("DATA x TYPE i.\nASSIGN ('X') TO FIELD-SYMBOL(<fs>)."));
    expect(procedure.supported).to.equal(false);
  });
});

describe("procedure analysis, helpers", () => {
  it("private variables: locals and pass-by-value parameters whose address is not taken", () => {
    const procedure = analyze(inMethod("DATA x TYPE i.\nattr = x + val + imp + result.\nGET REFERENCE OF x INTO DATA(r)."));
    const names = procedure.tokensOf(procedure.statements.find(s => s.concatTokens().startsWith("attr ="))!)
      .filter(t => procedure.private(procedure.identifierAt(t)) !== undefined).map(t => t.getStr());
    expect(names).to.deep.equal(["val", "result"]);
  });

  it("next executed statement skips declarations", () => {
    const procedure = analyze(inMethod("DATA(x) = 1.\nDATA y TYPE i.\nTYPES ty TYPE i.\nattr = x.\nIF attr = 1.\n  attr = y.\nENDIF."));
    const find = (text: string) => procedure.statements.find(s => s.concatTokens() === text)!;
    expect(procedure.nextExecuted(find("DATA(x) = 1."))).to.equal(find("attr = x."));
    expect(procedure.nextExecuted(find("attr = x."))).to.equal(find("IF attr = 1."));
    expect(procedure.nextExecuted(find("attr = y."))).to.equal(undefined);
  });

  it("static types of expressions", () => {
    const procedure = analyze(inMethod(`attr = 1.
text = 'abc'.
text = \`abc\`.
text = |a{ attr }|.
text = 'a' && text.
text = xsdbool( attr = 1 ).
attr = get( ).
ref = obj( ).
attr = obj( )->attr.
attr = strlen( text ).
attr = abs( attr ).
attr = attr + 1.
attr = CONV #( text ).`));
    const types = procedure.statements.filter(s => s.get() instanceof Statements.Move)
      .map(s => expressionType(procedure, s.findDirectExpression(Expressions.Source)!)?.toABAP());
    expect(types).to.deep.equal(["i", "c LENGTH 3", "string", "string", "string", "c LENGTH 1", "i", "REF TO lcl", "i",
      "i", undefined, undefined, undefined]);
  });

  it("formal parameters", () => {
    const procedure = analyze(inMethod(`DATA x TYPE i.
str( v = x ).
get( x ).
put( EXPORTING p = x ).
CALL METHOD put EXPORTING p = x.
ref = NEW lcl( s = |{ x }| ).
attr = get( p = x ) + x.`));
    const x = procedure.locals().find(v => v.identifier.getName() === "x")!;
    const formals = x.reads().map(o => formalParameter(procedure, o.statement, o.token));
    expect(formals.map(f => f?.parameter?.getName())).to.deep.equal(["v", "p", "p", "p", undefined, "p", undefined]);
    expect(x.reads().map(o => passedByValue(procedure, o.statement, o.token)))
      .to.deep.equal([true, false, false, false, false, false, false]);
  });

  it("class hierarchy", () => {
    const reg = new Registry().addFiles([
      new MemoryFile("zfoo.prog.abap", "CLASS lother DEFINITION.\nENDCLASS.\nCLASS lother IMPLEMENTATION.\nENDCLASS.\n"
        + inMethod("DATA x TYPE REF TO zcl_sub.")),
      new MemoryFile("zcl_super.clas.abap", "CLASS zcl_super DEFINITION PUBLIC.\n  PUBLIC SECTION.\n    INTERFACES zif_intf.\nENDCLASS.\nCLASS zcl_super IMPLEMENTATION.\nENDCLASS."),
      new MemoryFile("zcl_sub.clas.abap", "CLASS zcl_sub DEFINITION PUBLIC INHERITING FROM zcl_super.\nENDCLASS.\nCLASS zcl_sub IMPLEMENTATION.\nENDCLASS."),
      new MemoryFile("zif_intf.intf.abap", "INTERFACE zif_intf PUBLIC.\nENDINTERFACE."),
    ]).parse();
    const analysis = ObjectAnalysis.run(reg, reg.getObject("PROG", "ZFOO")!)!;
    const procedure = analysis.procedures.find(p => p.statements[0].concatTokens().toUpperCase() === "METHOD RUN.")!;
    const hierarchy = new Hierarchy(reg, procedure);
    expect(hierarchy.isSubtype("lsub", "lcl")).to.equal(true);
    expect(hierarchy.isSubtype("lsub", "lif")).to.equal(true);
    expect(hierarchy.isSubtype("lcl", "lsub")).to.equal(false);
    expect(hierarchy.isSubtype("lother", "lcl")).to.equal(false);
    expect(hierarchy.isSubtype("zcl_sub", "zcl_super")).to.equal(true);
    expect(hierarchy.isSubtype("zcl_sub", "zif_intf")).to.equal(true);
    expect(hierarchy.isSubtype("zcl_super", "zcl_sub")).to.equal(false);
    expect(hierarchy.isSubtype("zcl_unknown", "zcl_super")).to.equal(false);
  });
});
