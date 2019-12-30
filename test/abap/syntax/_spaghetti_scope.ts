import {expect} from "chai";
import {MemoryFile} from "../../../src/files";
import {Registry} from "../../../src/registry";
import {SyntaxLogic} from "../../../src/abap/syntax/syntax";
import {SpaghettiScope} from "../../../src/abap/syntax/_spaghetti_scope";
import {Position} from "../../../src/position";
import {ScopeType} from "../../../src/abap/syntax/_current_scope";

const filename = "zfoobar.prog.abap";

function run(reg: Registry): SpaghettiScope {
  const obj = reg.getABAPObjects()[0];

  for (const file of obj.getABAPFiles()) {
    if (file.getStructure() === undefined) {
      throw new Error("check variables test, parser error");
    }
  }

  return new SyntaxLogic(reg, obj).findIssues().spaghetti;
}

function runProgram(abap: string): SpaghettiScope {
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

  it("FORMs", () => {
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
    expect(scope1.length).to.be.greaterThan(0);
    expect(scope1[0].getIdentifier().stype).to.equal(ScopeType.Form);
    expect(scope1[0].getIdentifier().sname).to.equal("bar");

    const scope2 = spaghetti.lookupPosition(new Position(1, 1), filename);
    expect(scope2.length).to.be.greaterThan(0);
    expect(scope2[0].getIdentifier().stype).to.equal(ScopeType.Program);
  });

});