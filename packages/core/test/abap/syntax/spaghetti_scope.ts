import {expect} from "chai";
import {MemoryFile} from "../../../src/files";
import {Registry} from "../../../src/registry";
import {SyntaxLogic} from "../../../src/abap/5_syntax/syntax";
import {Position} from "../../../src/position";
import {ScopeType} from "../../../src/abap/5_syntax/_scope_type";
import {IRegistry} from "../../../src/_iregistry";
import {getABAPObjects} from "../../get_abap";
import {ISpaghettiScope} from "../../../src/abap/5_syntax/_spaghetti_scope";

const filename = "zfoobar.prog.abap";

function run(reg: IRegistry): ISpaghettiScope {
  const obj = getABAPObjects(reg)[0];

  for (const file of obj.getABAPFiles()) {
    if (file.getStructure() === undefined) {
      throw new Error("check variables test, parser error");
    }
  }

  return new SyntaxLogic(reg, obj).run().spaghetti;
}

function runProgram(abap: string): ISpaghettiScope {
  const file = new MemoryFile(filename, abap);
  const reg = new Registry().addFile(file).parse();
  return run(reg);
}

describe("Spaghetti Scope", () => {

  it("simple program", () => {
    const abap = "WRITE foobar.";
    const spaghetti = runProgram(abap);
    expect(spaghetti).to.not.equal(undefined);
  });

  it("FORMs, lookup position", () => {
    const abap =
      `DATA boo TYPE i.
      FORM bar.
        WRITE boo.
      ENDFORM.
      FORM something_else.
        WRITE boo.
      ENDFORM.`;
    const spaghetti = runProgram(abap);

    const scope1 = spaghetti.lookupPosition(new Position(3, 1), filename);
    expect(scope1?.getIdentifier().stype).to.equal(ScopeType.Form);
    expect(scope1?.getIdentifier().sname).to.equal("bar");

    const scope2 = spaghetti.lookupPosition(new Position(1, 1), filename);
    expect(scope2?.getIdentifier().stype).to.equal(ScopeType.Program);

    const scope3 = spaghetti.lookupPosition(new Position(6, 1), filename);
    expect(scope3?.getIdentifier().stype).to.equal(ScopeType.Form);
    expect(scope3?.getIdentifier().sname).to.equal("something_else");

    const id = scope1?.findScopeForVariable("boo");
    expect(id?.stype).to.equal(ScopeType.Program);
  });

  it("Two classes, lookup position", () => {
    const abap = `CLASS zcl_ret DEFINITION.
PUBLIC SECTION.
  CLASS-METHODS foo.
ENDCLASS.
CLASS zcl_ret IMPLEMENTATION.
METHOD foo.
  WRITE 1.
ENDMETHOD.
ENDCLASS.
CLASS zcl_ret2 DEFINITION.
PUBLIC SECTION.
  CLASS-METHODS blahblah.
ENDCLASS.
CLASS zcl_ret2 IMPLEMENTATION.
METHOD blahblah.
  WRITE 2.
ENDMETHOD.
ENDCLASS.`;

    const spaghetti = runProgram(abap);

    const scope1 = spaghetti.lookupPosition(new Position(16, 1), filename);
    expect(scope1?.getIdentifier().stype).to.equal(ScopeType.Method);
    expect(scope1?.getIdentifier().sname).to.equal("blahblah");
  });
});

describe("Spaghetti Scope, Definition + Read + Write positions", () => {

  it("inline FIELD-SYMBOL, check definition and write position", () => {
    const abap = `
    DATA lt_foo TYPE STANDARD TABLE OF i.
    LOOP AT lt_foo ASSIGNING FIELD-SYMBOL(<lv_foo>).
    ENDLOOP.`;
    const spaghetti = runProgram(abap);
    const defs = spaghetti.listDefinitions(filename);
    expect(defs.length).to.equal(2, "definitions");
    const reads = spaghetti.listReadPositions(filename);
    expect(reads.length).to.equal(1, "reads");
    const writes = spaghetti.listWritePositions(filename);
    expect(writes.length).to.equal(1, "writes");
  });

});