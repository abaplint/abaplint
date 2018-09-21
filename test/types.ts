import * as chai from "chai";
import Runner from "../src/runner";
import {Result} from "../src/types";
import {File} from "../src/file";

let expect = chai.expect;

function run(abap: string): Result {
  let file = new Runner().parse([new File("temp.abap", abap)])[0];
  return Runner.types(file);
}

let sourcesTests = [
  {abap: "LOOP AT lt_foo INTO ls_foo.", cnt: 1},
  {abap: "WRITE / 'foobar'.", cnt: 1},
  {abap: "SKIP.", cnt: 0},
];

describe("types - count sources", () => {
  sourcesTests.forEach((test) => {
    it("\"" + test.abap + "\" should have " + test.cnt, () => {
      expect(run(test.abap).getSourceCount()).to.equals(test.cnt);
    });
  });
});

let typesTests = [
  {abap: "LOOP AT lt_foo INTO ls_foo.", cnt: 0},
  {abap: "WRITE / 'foobar'.", cnt: 0},
  {abap: "SKIP.", cnt: 0},
  {abap: "TYPES foo TYPE STANDARD TABLE OF vbak WITH EMPTY KEY.", cnt: 1},
];

describe("types - count types", () => {
  typesTests.forEach((test) => {
    it("\"" + test.abap + "\" should have " + test.cnt, () => {
      expect(run(test.abap).getTypeCount()).to.equals(test.cnt);
    });
  });
});

let variablesTests = [
  {abap: "LOOP AT lt_foo INTO ls_foo.", cnt: 0},
  {abap: "WRITE / 'foobar'.", cnt: 0},
  {abap: "SKIP.", cnt: 0},
  {abap: "TYPES foo TYPE STANDARD TABLE OF vbak WITH EMPTY KEY.", cnt: 0},
  {abap: "DATA foo TYPE c LENGTH 1.", cnt: 1},
];

describe("types - count variables", () => {
  variablesTests.forEach((test) => {
    it("\"" + test.abap + "\" should have " + test.cnt, () => {
      expect(run(test.abap).getVariableCount()).to.equals(test.cnt);
    });
  });
});