/*
import {expect} from "chai";
import {getStatements} from "./_utils";
import {Unknown} from "../../src/abap/statements/_statement";
import {Write} from "../../src/abap/statements";
*/

describe("statement parser", function() {
// todo, add test where "moo" is a macro?
/*
  it("Unknown statements should be lazy, 2 statements", function () {
    const abap = "moo bar\n" +
      "WRITE bar.";

    const statements = getStatements(abap);
    console.dir(statements);
    expect(statements.length).to.equal(2);
    expect(statements[0]).to.be.instanceof(Unknown);
    expect(statements[1]).to.be.instanceof(Write);
  });
*/
/*
  it("Unknown statements should be lazy, 3 statements", function () {
    const abap = "WRITE moo.\n" +
      "moo bar\n" +
      "WRITE bar.";

    const statements = getStatements(abap);
    console.dir(statements);
    expect(statements.length).to.equal(2);
    expect(statements[0]).to.be.instanceof(Write);
    expect(statements[1]).to.be.instanceof(Unknown);
    expect(statements[2]).to.be.instanceof(Write);
  });
*/
/*
  it("Unknown statements should be lazy, multi line", function () {
    const abap = "moo\nbar\n" +
      "WRITE bar.";

    const statements = getStatements(abap);
    console.dir(statements);
    expect(statements.length).to.equal(2);
    expect(statements[0]).to.be.instanceof(Unknown);
    expect(statements[1]).to.be.instanceof(Write);
  });
*/
});