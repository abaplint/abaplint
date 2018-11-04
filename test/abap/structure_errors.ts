import * as Structures from "../../src/abap/structures/";
import {expect} from "chai";
import {Structure} from "../../src/abap/structures/_structure";
import {getStatements, parse} from "../_utils";
import StructureParser from "../../src/abap/structure_parser";
import {StructureNode} from "../../src/abap/node";

const cases = [
  {abap: "IF foo = bar.", error: "Expected ENDIF", structure: new Structures.If(), errorMatched: 1},
  {abap: "IF foo = bar. moo = boo.", error: "Expected ENDIF", structure: new Structures.If(), errorMatched: 2},
  {abap: "IF foo = bar. ENDWHILE.", error: "Expected ENDIF", structure: new Structures.If(), errorMatched: 1},
  {abap: "IF foo = bar. ENDWHILE. ENDIF.", error: "Expected ENDIF", structure: new Structures.If(), errorMatched: 1},
];

describe("Structure, test error messages, specific", function() {
  cases.forEach((c: {abap: string, error: string, structure: Structure, errorMatched: number}) => {
    it(c.abap, function () {
      const result = c.structure.getMatcher().run(getStatements(c.abap), new StructureNode());
      expect(result.error).to.equal(true);
      expect(result.errorMatched).to.equal(c.errorMatched);
      expect(result.errorDescription).to.equal(c.error);
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

describe("Structure, test error messages, parser", function() {
  parser.forEach((c: {abap: string, error: string}) => {
    it(c.abap, function () {
      const file = parse(c.abap);
      const issues = StructureParser.run(file).issues;
      if (c.error === "") {
        expect(issues.length).to.equal(0);
      } else {
        expect(issues.length).to.equal(1);
        expect(issues[0].getMessage()).to.equal(c.error);
      }
    });
  });
});