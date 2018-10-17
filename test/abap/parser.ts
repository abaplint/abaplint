import Runner from "../../src/runner";
import {MemoryFile} from "../../src/files";
import Parser from "../../src/abap/parser";
import {expect} from "chai";

const cases = [
  {abap: "DO 2 TIMES. ENDDO.", filename: "foo.prog.abap", errors: 0},
  {abap: "DO 2 TIMES.\n*comment\nENDDO.", filename: "foo.prog.abap", errors: 0},
  {abap: "DO 2 TIMES.", filename: "foo.prog.abap", errors: 1},
];

describe("Parser, structureType()", function() {
  cases.forEach((c: {abap: string, filename: string, errors: number}) => {
    it(c.abap, function () {
      const file = new Runner([new MemoryFile(c.filename, c.abap)]).parse()[0];
      const issues = Parser.runStructure(file);
      expect(issues.length).to.equal(c.errors);
    });
  });
});
