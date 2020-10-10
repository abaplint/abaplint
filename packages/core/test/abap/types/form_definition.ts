import {expect} from "chai";
import {Registry} from "../../../src/registry";
import {IRegistry} from "../../../src/_iregistry";
import {getABAPObjects} from "../../get_abap";
import {SyntaxLogic} from "../../../src/abap/5_syntax/syntax";
import {MemoryFile} from "../../../src/files/memory_file";

let reg: IRegistry = new Registry();

function runProgram(abap: string) {
  reg = new Registry().addFile(new MemoryFile("zfoobar.prog.abap", abap)).parse();
  const obj = getABAPObjects(reg)[0];

  const scope = new SyntaxLogic(reg, obj).run().spaghetti.getTop().getFirstChild();
  if (scope === undefined) {
    return [];
  }
  return scope.listFormDefinitions();
}

describe("Types, FormDefinition", () => {

  it("negative, parser error", () => {
    const defs = runProgram("moo boo");
    expect(defs.length).to.equal(0);
  });

  it("one FORM, no parameters", () => {
    const abap = "FORM moo.\nENDFORM.\n";
    const defs = runProgram(abap);
    expect(defs.length).to.equal(1);
  });

  it("two FORMs", () => {
    const abap = "FORM moo.\nENDFORM.\nFORM boo.\nENDFORM.\n";
    const defs = runProgram(abap);
    expect(defs.length).to.equal(2);
  });

  it("one FORM, one parameter", () => {
    const abap = "FORM moo USING blah.\nENDFORM.\n";
    const defs = runProgram(abap);
    expect(defs.length).to.equal(1);
    const params = defs[0].getUsingParameters();
    expect(params.length).to.equal(1);
    expect(params[0].getName()).to.equal("blah");

    const using = defs[0].getUsingParameters();
    expect(using.length).to.equal(1);
    expect(using[0].getName()).to.equal("blah");
  });

  it("one FORM, one parameter, pass by VALUE", () => {
    const abap = "FORM moo USING VALUE(bar).\nENDFORM.";
    const defs = runProgram(abap);

    expect(defs.length).to.equal(1);
    const params = defs[0].getUsingParameters();
    expect(params.length).to.equal(1);
    expect(params[0].getName()).to.equal("bar");
  });

});