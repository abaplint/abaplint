import * as Structures from "../../src/abap/3_structures/structures";
import {expect} from "chai";
import {IStructure} from "../../src/abap/3_structures/structures/_structure";
import {findIssues} from "./_utils";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";

const cases = [
  {abap: "IF foo = bar.", error: "Expected ENDIF", structure: new Structures.If(), errorMatched: 1},
  {abap: "IF foo = bar. moo = boo.", error: "Expected ENDIF", structure: new Structures.If(), errorMatched: 2},
  {abap: "IF foo = bar. ENDWHILE.", error: "Expected ENDIF", structure: new Structures.If(), errorMatched: 1},
  {abap: "IF foo = bar. ENDWHILE. ENDIF.", error: "Expected ENDIF", structure: new Structures.If(), errorMatched: 1},
];

describe("Structure, test error messages, specific", () => {
  cases.forEach((c: {abap: string, error: string, structure: IStructure, errorMatched: number}) => {
    it.skip(c.abap, () => {
// todo, refactor?
/*
      const result = c.structure.getMatcher().run(getStatements(c.abap), new StructureNode(c.structure));
      expect(result.error).to.equal(true);
      expect(result.errorMatched).to.equal(c.errorMatched);
      expect(result.errorDescription).to.equal(c.error);
      */
    });
  });
});


const parser = [
  {abap: "ENDIF.", error: "Unexpected ENDIF"},
  {abap: "IF foo = bar.", error: "Expected ENDIF"},
  {abap: "IF foo = bar. ENDIF. ENDWHILE.", error: "Unexpected ENDWHILE"},
  {abap: "CLASS zfoo DEFINITION. ENDCLASS.", error: ""},
  {abap: "IF foo = bar. ENDIF. WRITE asdf.", error: ""},
  {abap: "IF foo = bar. IF moo = boo.", error: "Expected ENDIF"},
  {abap: "IF foo = bar. IF moo = boo. ENDIF.", error: "Expected ENDIF"},
  {abap: "CLASS zfoo DEFINITION. PUBLIC SECTION. ENDCLASS.", error: ""},
  {abap: "DO 2 TIMES. ENDDO.", error: ""},
  {abap: "DO 2 TIMES.\n*comment\nENDDO.", error: ""},
  {abap: "DO 2 TIMES.", error: "Expected ENDDO"},
  {abap: "CLASS zfoo DEFINITION. PUBLIC SECTION. WRITE asdf. ENDCLASS.", error: "Expected ENDCLASS"},
];

describe("Structure, test error messages, parser", () => {
  parser.forEach((c: {abap: string, error: string}) => {
    it(c.abap, () => {
      const issues = findIssues(c.abap).filter(i => i.getKey() === "structure");
      if (c.error === "") {
        expect(issues.length).to.equal(0);
      } else {
        expect(issues.length).to.equal(1);
        expect(issues[0].getMessage()).to.equal(c.error);
      }
    });
  });
});

describe("Structure, test empty class", () => {
  it("empty class file", () => {
    const file = new MemoryFile("zcl_foo.clas.abap", "");
    const issues = new Registry().addFile(file).findIssues();
    let found = false;
    for (const issue of issues) {
      if (issue.getMessage() === "Expected CLASSDEFINITION") {
        found = true; // this can be done smarter somehow?
      }
    }
    expect(found).to.equal(true);
  });
});