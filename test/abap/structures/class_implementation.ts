import {expect} from "chai";
import * as Structures from "../../../src/abap/structures";
import {Statement} from "../../../src/abap/statements/statement";
import Runner from "../../../src/runner";
import {MemoryFile} from "../../../src/files";

let cases = [
  {abap: "CLASS zfoo IMPLEMENTATION. ENDCLASS."},
  {abap: "CLASS zfoo IMPLEMENTATION. METHOD foo. ENDMETHOD. ENDCLASS."},
  {abap: "CLASS zfoo IMPLEMENTATION. METHOD foo. moo = boo. ENDMETHOD. ENDCLASS."},
];

function run(abap: string): Statement[] {
  let file = new Runner([new MemoryFile("cl_foo.clas.abap", abap)]).parse()[0];
  return file.getStatements();
}

describe("Structure type", function() {
  cases.forEach((c: {abap: string}) => {
    it(c.abap, function () {
      const statements = run(c.abap);
      const length = statements.length;
      const match = new Structures.ClassImplementation().getMatcher().run(statements);
      expect(match.error).to.equal(false);
      expect(match.matched.length).to.equal(length);
    });
  });
});