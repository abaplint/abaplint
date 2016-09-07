import "../typings/index.d.ts";
import * as chai from "chai";
import Runner from "../src/runner";
import {File} from "../src/file";

let expect = chai.expect;

let sourcesTests = [
  {abap: "LOOP AT lt_foo INTO ls_foo.", cnt: 1},
  {abap: "WRITE / 'foobar'.", cnt: 1},
  {abap: "SKIP.", cnt: 0},
];

describe("types - count sources", () => {
  sourcesTests.forEach((test) => {
    let file = Runner.parse([new File("temp.abap", test.abap)])[0];

    let result = Runner.types(file);

    it("\"" + test.abap + "\" should have " + test.cnt, () => {
      expect(result.getSourceCount()).to.equals(test.cnt);
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
    let file = Runner.parse([new File("temp.abap", test.abap)])[0];

    let result = Runner.types(file);

    it("\"" + test.abap + "\" should have " + test.cnt, () => {
      expect(result.getTypeCount()).to.equals(test.cnt);
    });
  });
});