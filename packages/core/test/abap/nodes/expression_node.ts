import {expect} from "chai";
import {ExpressionNode, StatementNode, TokenNode} from "../../../src/abap/nodes";
import {Constant, FieldChain, Source} from "../../../src/abap/2_statements/expressions";
import {Move} from "../../../src/abap/2_statements/statements";
import {Identifier, StringToken} from "../../../src/abap/1_lexer/tokens";
import {Position} from "../../../src/position";

const DEPTH = 20000;

function token(row: number, str: string): TokenNode {
  return new TokenNode(new StringToken(new Position(row, 1), str));
}

function constant(row: number, str: string): ExpressionNode {
  return new ExpressionNode(new Constant()).setChildren([token(row, str)]);
}

/** Source(`a`, &&, Source(`b`, &&, ... Source(`b`))), nested as the parser nests an operator chain */
function buildChain(): ExpressionNode {
  let source = new ExpressionNode(new Source()).setChildren([constant(DEPTH + 1, "`b`")]);
  for (let i = DEPTH; i >= 1; i--) {
    const operand = constant(i, i === 1 ? "`a`" : "`b`");
    source = new ExpressionNode(new Source()).setChildren([operand, new TokenNode(new Identifier(new Position(i, 5), "&&")), source]);
  }
  return source;
}

describe("Expression node, deeply nested", () => {
  const outer = buildChain();

  it("tokens", () => {
    expect(outer.countTokens()).to.equal(DEPTH * 2 + 1);
    expect(outer.getTokens().length).to.equal(DEPTH * 2 + 1);
    expect(outer.getAllTokens().length).to.equal(DEPTH * 2 + 1);
    expect(outer.getFirstToken().getStr()).to.equal("`a`");
    expect(outer.getLastToken().getStr()).to.equal("`b`");
    expect(outer.getLastToken().getRow()).to.equal(DEPTH + 1);
    expect(outer.getTokens().slice(0, 4).map(t => t.getStr())).to.deep.equal(["`a`", "&&", "`b`", "&&"]);
  });

  it("find expressions", () => {
    expect(outer.findAllExpressionsRecursive(Source).length).to.equal(DEPTH);
    expect(outer.findAllExpressions(Source).length).to.equal(1);
    expect(outer.findAllExpressions(Constant).length).to.equal(DEPTH + 1);
    expect(outer.findAllExpressionsMulti([Constant, Source]).length).to.equal(2);
    expect(outer.findAllExpressionsMulti([Constant, Source], true).length).to.equal(DEPTH * 2 + 1);
    expect(outer.findFirstExpression(FieldChain)).to.equal(undefined);
    expect(outer.findAllExpressions(Constant)[1].getFirstToken().getRow()).to.equal(2);
  });

  it("statement", () => {
    const statement = new StatementNode(new Move()).setChildren([outer, new TokenNode(new Identifier(new Position(DEPTH + 2, 1), "."))]);
    expect(statement.getTokens().length).to.equal(DEPTH * 2 + 2);
    expect(statement.getFirstToken().getStr()).to.equal("`a`");
    expect(statement.getLastToken().getStr()).to.equal(".");
    expect(statement.findAllExpressionsRecursive(Source).length).to.equal(DEPTH + 1);
    expect(statement.findAllExpressions(Source).length).to.equal(1);
    expect(statement.findAllExpressionsMulti([Constant, Source], true).length).to.equal(DEPTH * 2 + 2);
    expect(statement.findFirstExpression(FieldChain)).to.equal(undefined);
    expect(statement.findFirstExpression(Constant)?.getFirstToken().getStr()).to.equal("`a`");
  });
});
