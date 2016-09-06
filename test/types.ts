import "../typings/index.d.ts";
import * as chai from "chai";
import Runner from "../src/runner";
import {File} from "../src/file";

let expect = chai.expect;

let tests = [
  {abap: "LOOP AT lt_foo INTO ls_foo.", cnt: 1},
  {abap: "WRITE / 'foobar'.", cnt: 1},
  {abap: "SKIP.", cnt: 0},
];

describe("types - count sources", () => {
  tests.forEach((test) => {
    let file = new File("temp.abap", test.abap);
    Runner.run([file]);
    let result = Runner.types(file);

    it("\"" + test.abap + "\" should have " + test.cnt, () => {
      expect(result.getSourceCount()).to.equals(test.cnt);
    });
  });
});