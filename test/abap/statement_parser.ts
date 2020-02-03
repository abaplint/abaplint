import {expect} from "chai";
import {getTokens, getStatements} from "./_utils";
import {MacroCall, Unknown} from "../../src/abap/statements/_statement";
import {StatementParser} from "../../src/abap/statement_parser";
import {Config} from "../../src/config";
import {Write} from "../../src/abap/statements";


describe("statement parser", function() {

  it("Stupid macro", function () {
    const abap = "moo bar\n" +
      "WRITE bar.";

    const iconfig = Config.getDefault().get();
    iconfig.syntax.globalMacros = ["moo"];
    const config = new Config(JSON.stringify(iconfig));

    const statements = new StatementParser().run(getTokens(abap), config);
    expect(statements.length).to.equal(1);
    expect(statements[0].get()).to.be.instanceof(MacroCall);
  });

  it("Unknown statements should be lazy, 2 statements", function () {
    const abap = "moo bar\n" +
      "WRITE bar.";

    const statements = getStatements(abap);
    expect(statements.length).to.equal(2);
    expect(statements[0].get()).to.be.instanceof(Unknown);
    expect(statements[1].get()).to.be.instanceof(Write);
  });

  it("Unknown statements should be lazy, 3 statements", function () {
    const abap = "WRITE moo.\n" +
      "moo bar\n" +
      "WRITE bar.";

    const statements = getStatements(abap);
    expect(statements.length).to.equal(3);
    expect(statements[0].get()).to.be.instanceof(Write);
    expect(statements[1].get()).to.be.instanceof(Unknown);
    expect(statements[2].get()).to.be.instanceof(Write);
  });

  it("Unknown statements should be lazy, multi line", function () {
    const abap = "moo\nbar\n" +
      "WRITE bar.";

    const statements = getStatements(abap);
    expect(statements.length).to.equal(2);
    expect(statements[0].get()).to.be.instanceof(Unknown);
    expect(statements[1].get()).to.be.instanceof(Write);
  });

  it("Chained/Colon statement", function () {
    const abap = "WRITE: bar.";

    const statements = getStatements(abap);
    expect(statements.length).to.equal(1);
    expect(statements[0].get()).to.be.instanceof(Write);
    expect(statements[0].getColon()).to.not.equal(undefined);
  });

  it("Keep track of pragmas", function () {
    const abap = "WRITE bar ##foobar.";

    const statements = getStatements(abap);
    expect(statements.length).to.equal(1);
    expect(statements[0].get()).to.be.instanceof(Write);
    expect(statements[0].getPragmas().length).to.equal(1);
  });

});