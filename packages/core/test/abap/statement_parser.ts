import {expect} from "chai";
import {getStatements} from "./_utils";
import {Empty, MacroCall, Unknown} from "../../src/abap/2_statements/statements/_statement";
import {StatementParser} from "../../src/abap/2_statements/statement_parser";
import {Write, Data, InsertDatabase} from "../../src/abap/2_statements/statements";
import {defaultVersion, Version} from "../../src/version";
import {Lexer} from "../../src/abap/1_lexer/lexer";
import {MemoryFile} from "../../src/files/memory_file";


describe("statement parser", () => {

  it("Stupid macro", () => {
    const abap = "moo bar\n" +
      "WRITE bar.";

    const globalMacros = ["moo"];

    const lexerResult = new Lexer().run(new MemoryFile("cl_foo.clas.abap", abap));
    const statements = new StatementParser(defaultVersion).run([lexerResult], globalMacros);
    expect(statements.length).to.equal(1);
    expect(statements[0].statements[0].get()).to.be.instanceof(MacroCall);
  });

  it("Stupid macro with dashes", () => {
    const abap = "moo-bar.";

    const globalMacros = ["moo-bar"];

    const lexerResult = new Lexer().run(new MemoryFile("cl_foo.clas.abap", abap));
    const statements = new StatementParser(defaultVersion).run([lexerResult], globalMacros);
    expect(statements.length).to.equal(1);
    expect(statements[0].statements[0].get()).to.be.instanceof(MacroCall);
  });

  it("Unknown statements should be lazy, 2 statements", () => {
    const abap = "moo bar\n" +
      "WRITE bar.";

    const statements = getStatements(abap);
    expect(statements.length).to.equal(2);
    expect(statements[0].get()).to.be.instanceof(Unknown);
    expect(statements[1].get()).to.be.instanceof(Write);
  });

  it("Unknown statements should be lazy, 3 statements", () => {
    const abap = "WRITE moo.\n" +
      "moo bar\n" +
      "WRITE bar.";

    const statements = getStatements(abap);
    expect(statements.length).to.equal(3);
    expect(statements[0].get()).to.be.instanceof(Write);
    expect(statements[1].get()).to.be.instanceof(Unknown);
    expect(statements[2].get()).to.be.instanceof(Write);
  });

  it("Unknown statements should be lazy, multi line", () => {
    const abap = "moo\nbar\n" +
      "WRITE bar.";

    const statements = getStatements(abap);
    expect(statements.length).to.equal(2);
    expect(statements[0].get()).to.be.instanceof(Unknown);
    expect(statements[1].get()).to.be.instanceof(Write);
  });

  it("Chained/Colon statement", () => {
    const abap = "WRITE: bar.";

    const statements = getStatements(abap);
    expect(statements.length).to.equal(1);
    expect(statements[0].get()).to.be.instanceof(Write);
    expect(statements[0].getColon()).to.not.equal(undefined);
  });

  it("Keep track of pragmas", () => {
    const abap = "WRITE bar ##foobar.";

    const statements = getStatements(abap);
    expect(statements.length).to.equal(1);
    expect(statements[0].get()).to.be.instanceof(Write);
    expect(statements[0].getPragmas().length).to.equal(1);
  });

  it("Chained, pragma malplaced", () => {
    const abap = "DATA ##NEEDED: foo, bar.";

    const statements = getStatements(abap);
    expect(statements.length).to.equal(2);
    expect(statements[0].get()).to.be.instanceof(Data);
    expect(statements[0].getPragmas().length).to.equal(1);
    expect(statements[1].get()).to.be.instanceof(Data);
    expect(statements[1].getPragmas().length).to.equal(1);
  });

  it("Cloud test", () => {
    const abap = "INSERT (tablename) FROM TABLE @<tab>.";

    const statements = getStatements(abap, Version.Cloud);
    expect(statements.length).to.equal(1);
    expect(statements[0].get()).to.be.instanceof(InsertDatabase);
  });

  it("dangling pragma, should be empty statement", () => {
    const abap = "WRITE foobar. ##PRAGMA";

    const statements = getStatements(abap);
    expect(statements.length).to.equal(2);
    expect(statements[0].get()).to.be.instanceof(Write);
    expect(statements[1].get()).to.be.instanceof(Empty);
    expect(statements[1].getPragmas().length).to.equal(1);
  });

});