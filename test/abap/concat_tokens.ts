import {expect} from "chai";
import {getStatements} from "./_utils";

describe("concat_tokens", () => {
  let tests = [
    "REPORT zfoo.",
    "WRITE 'Hello'.",
    "WRITE foo-bar.",
  ];

  tests.forEach((test) => {
    it(test, () => {
      let statements = getStatements(test);
      let concat = statements[0].concatTokens();
      expect(concat).to.equals(test);
    });
  });
});
