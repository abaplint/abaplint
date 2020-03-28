import {expect} from "chai";
import {getStatements} from "./_utils";

describe("concat_tokens", () => {
  const tests = [
    "REPORT zfoo.",
    "WRITE 'Hello'.",
    "WRITE foo-bar.",
  ];

  tests.forEach((test) => {
    it(test, () => {
      const statements = getStatements(test);
      const concat = statements[0].concatTokens();
      expect(concat).to.equals(test);
    });
  });
});
