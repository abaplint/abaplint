import {File} from "../src/file";
import Runner from "../src/runner";
import * as chai from "chai";

let expect = chai.expect;

describe("concat_tokens", () => {
  let tests = [
    "REPORT zfoo.",
    "WRITE 'Hello'.",
    "WRITE foo-bar.",
  ];

  tests.forEach((test) => {
    it(test, () => {
      let file = Runner.parse([new File("temp.abap", test)])[0];
      let concat = file.getStatements()[0].concatTokens();
      expect(concat).to.equals(test);
    });
  });
});
