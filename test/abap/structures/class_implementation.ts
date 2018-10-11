import {expect} from "chai";
import * as Structures from "../../../src/abap/structures";
import {Statement} from "../../../src/abap/statements/statement";
import Runner from "../../../src/runner";
import {MemoryFile} from "../../../src/files";
import Parser from "../../../src/abap/parser";

let cases = [
  {abap: "CLASS zfoo IMPLEMENTATION. ENDCLASS."},
];

function run(abap: string): Statement[] {
  let file = new Runner([new MemoryFile("cl_foo.clas.abap", abap)]).parse()[0];
  return file.getStatements();
}

describe("Structure type", function() {
  cases.forEach((c: any) => {
    const structure = Parser.runStructure(run(c.abap));
    expect(structure).to.be.instanceof(Structures.ClassImplementation);
  });
});