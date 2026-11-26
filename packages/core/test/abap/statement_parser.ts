import {expect} from "chai";
import {getStatements} from "./_utils";
import {Empty, MacroCall, Unknown} from "../../src/abap/2_statements/statements/_statement";
import {StatementParser} from "../../src/abap/2_statements/statement_parser";
import {Write, Data, InsertDatabase, Move} from "../../src/abap/2_statements/statements";
import {Source, Constant, FieldChain} from "../../src/abap/2_statements/expressions";
import {ExpressionNode, TokenNode} from "../../src/abap/nodes";
import {defaultRelease, Release, LanguageVersion} from "../../src/version";
import {Lexer} from "../../src/abap/1_lexer/lexer";
import {MemoryFile} from "../../src/files/memory_file";


describe("statement parser", () => {

  it("Stupid macro", () => {
    const abap = "moo bar\n" +
      "WRITE bar.";

    const globalMacros = ["moo"];

    const lexerResult = new Lexer().run(new MemoryFile("cl_foo.clas.abap", abap));
    const statements = new StatementParser(defaultRelease).run([lexerResult], globalMacros);
    expect(statements.length).to.equal(1);
    expect(statements[0].statements[0].get()).to.be.instanceof(MacroCall);
  });

  it("Stupid macro with dashes", () => {
    const abap = "moo-bar.";

    const globalMacros = ["moo-bar"];

    const lexerResult = new Lexer().run(new MemoryFile("cl_foo.clas.abap", abap));
    const statements = new StatementParser(defaultRelease).run([lexerResult], globalMacros);
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

    const statements = getStatements(abap, Release.Newest, LanguageVersion.Cloud);
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
    expect(statements[1].getTokens()).to.deep.equal(statements[1].getPragmas());
  });

  it("bad string template", () => {
    const abap = "WRITE |}|.";

    const statements = getStatements(abap);
    expect(statements.length).to.equal(1);
    expect(statements[0].get()).to.be.instanceof(Unknown);
  });

  it("ok string template", () => {
    const abap = "WRITE |sd\\{f\\}|.";

    const statements = getStatements(abap);
    expect(statements.length).to.equal(1);
    expect(statements[0].get()).to.be.instanceof(Write);
  });

  it("operator chain, the same nested tree as the recursive grammar", () => {
    const statements = getStatements("foo = bar && `b` && 3.");
    expect(statements.length).to.equal(1);
    expect(statements[0].get()).to.be.instanceof(Move);

    // Source(bar, &&, Source(`b`, &&, Source(3)))
    const outer = statements[0].findDirectExpression(Source)!;
    expect(outer.getChildren().map(c => c instanceof TokenNode ? c.concatTokens() : c.get().constructor.name))
      .to.deep.equal(["FieldChain", "&&", "Source"]);
    const middle = outer.findDirectExpression(Source)!;
    expect(middle.getChildren().map(c => c instanceof TokenNode ? c.concatTokens() : c.get().constructor.name))
      .to.deep.equal(["Constant", "&&", "Source"]);
    const inner = middle.findDirectExpression(Source)!;
    expect(inner.getChildren().length).to.equal(1);
    expect(inner.findDirectExpression(Constant)?.concatTokens()).to.equal("3");
    expect(outer.findDirectExpression(FieldChain)?.concatTokens()).to.equal("bar");
  });

  it("operator chain, mixed operators and a REF at the end", () => {
    const statements = getStatements("foo = 1 + 2 * bar - REF #( moo ).");
    expect(statements[0].get()).to.be.instanceof(Move);
    expect(statements[0].findAllExpressionsRecursive(Source).length).to.equal(5);
  });

  it("long operator chain, parsed without exhausting the call stack", () => {
    const lines = ["foo = `a`"];
    for (let i = 0; i < 5000; i++) {
      lines.push("  && `b`");
    }
    lines.push("  .");
    const statements = getStatements(lines.join("\n"));
    expect(statements.length).to.equal(1);
    expect(statements[0].get()).to.be.instanceof(Move);

    // and the node helpers walk the nesting with a stack
    const sources = statements[0].findAllExpressionsRecursive(Source);
    expect(sources.length).to.equal(5001);
    const outer = sources[0] as ExpressionNode;
    expect(outer.getLastToken().getStr()).to.equal("`b`");
    expect(outer.getFirstToken().getStr()).to.equal("`a`");
    expect(outer.countTokens()).to.equal(10001);
    expect(outer.findAllExpressions(Constant).length).to.equal(5001);
    expect(outer.findAllExpressionsMulti([Constant, Source]).length).to.equal(2);
    expect(outer.findAllExpressionsMulti([Constant, Source], true).length).to.equal(10001);
    expect(outer.findFirstExpression(FieldChain)).to.equal(undefined);
    expect(statements[0].getTokens().length).to.equal(10004);
  });

});
