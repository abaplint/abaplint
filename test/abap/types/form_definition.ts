import {expect} from "chai";
import {Registry} from "../../../src/registry";
import {MemoryFile} from "../../../src/files";
import {FormDefinition} from "../../../src/abap/types";

function runProgram(abap: string): FormDefinition[] {
  const reg = new Registry().addFile(new MemoryFile("zfoobar.prog.abap", abap)).parse();
  const file = reg.getABAPFiles()[0];
  return file.getFormDefinitions();
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
    expect(defs[0].getParameters().length).to.equal(0);
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
    const params = defs[0].getParameters();
    expect(params.length).to.equal(1);
    expect(params[0].getName()).to.equal("blah");

    const using = defs[0].getUsingParameters();
    expect(using.length).to.equal(1);
    expect(using[0].getName()).to.equal("blah");
  });

});