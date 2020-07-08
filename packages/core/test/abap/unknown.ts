import {expect} from "chai";
import {Unknown} from "../../src/abap/2_statements/statements/_statement";
import {getStatements} from "./_utils";

describe("unknown statements", () => {
  const tests = [
    "data foo bar.",
    "asdf.",
    "asdf",
    "asdf asdf.",
    "METHODS run RETURNING str TYPE string.", // VALUE is missing
  ];

  tests.forEach((abap) => {
    it("\"" + abap + "\" should be unknown", () => {
      const statements = getStatements(abap);

      expect(statements.length).to.equals(1);
      for (const statement of statements) {
        expect(statement.get() instanceof Unknown).to.equals(true);
      }
    });
  });
});