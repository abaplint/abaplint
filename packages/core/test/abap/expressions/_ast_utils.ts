import {expect} from "chai";
import {StatementNode, ExpressionNode, TokenNode} from "../../../src/abap/nodes";

export type ASTTuple = readonly [string, Record<string, string>, readonly ASTTuple[]];

function nodeToTuple(node: ExpressionNode | TokenNode | StatementNode): ASTTuple {
  if (node instanceof TokenNode) {
    return [node.get().constructor.name, {text: node.get().getStr()}, []];
  }
  const name = node instanceof StatementNode
    ? node.get().constructor.name
    : (node as ExpressionNode).get().constructor.name;
  const children = node.getChildren().map(nodeToTuple);
  return [name, {}, children];
}

export function statementToTuple(stmt: StatementNode): ASTTuple {
  return nodeToTuple(stmt);
}

export function assertASTEqual(expected: ASTTuple, actual: ASTTuple, path: string = ""): void {
  const [expName, expAttrs, expChildren] = expected;
  const [actName, actAttrs, actChildren] = actual;

  expect(actName, `node name at ${path || "root"}`).to.equal(expName);

  if ("text" in expAttrs) {
    expect((actAttrs as Record<string, string>)["text"], `token text at ${path || "root"}`).to.equal(expAttrs["text"]);
  }

  expect(actChildren.length, `child count at [${expName}]${path}`).to.equal(expChildren.length);
  for (let i = 0; i < expChildren.length; i++) {
    assertASTEqual(expChildren[i], actChildren[i], `${path}[${expName}][${i}]`);
  }
}
