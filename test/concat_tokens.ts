import {File} from "../src/file";
import Runner from "../src/runner";
import {expect} from "chai";

describe("concat_tokens", () => {
  let tests = [
    "REPORT zfoo.",
    "WRITE 'Hello'.",
    "WRITE foo-bar.",
  ];

  tests.forEach((test) => {
    it(test, () => {
      let file = new Runner([new File("cl_foo.clas.abap", test)]).parse()[0];
      let concat = file.getStatements()[0].concatTokens();
      expect(concat).to.equals(test);
    });
  });
});
