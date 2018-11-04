import {expect} from "chai";
import {Unknown} from "../../src/abap/statements/_statement";
import {getStatements} from "./_utils";

describe("unknown statements", () => {
  let tests =  [
    "data foo bar.",
    "asdf.",
    "asdf",
    "asdf asdf.",
  ];

  tests.forEach((abap) => {
    it("\"" + abap + "\" should be unknown", () => {
      let statements = getStatements(abap);

      expect(statements.length).to.equals(1);
      for (let statement of statements) {
        expect(statement instanceof Unknown).to.equals(true);
      }
    },
  );
  });
});