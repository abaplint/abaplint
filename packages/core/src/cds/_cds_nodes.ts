import {AbstractToken} from "../abap/1_lexer/tokens/abstract_token";
import {ExpressionNode, TokenNode} from "../abap/nodes";
import {CDSFunction, CDSPrefixedName} from "./expressions";

/** "entity": a CDS entity, table or view,
 * "path": a path expression like "I_FOO( p : 1 )._Assoc", name is that of its first entity, the entity selected from is
 * the target of the last association,
 * "function": a function call whose arguments are not CDS parameter passing */
export type CDSSourceEntity = {
  /** as written, without spaces, eg. "/ABC/I_FOO" */
  name: string,
  token: AbstractToken,
  kind: "entity" | "path" | "function",
};

/** the entity of a CDSSource node, undefined for a parenthesized join */
export function readSourceEntity(source: ExpressionNode): CDSSourceEntity | undefined {
  const first = source.getFirstChild();
  if (first instanceof ExpressionNode && first.get() instanceof CDSFunction) {
    // arguments which are not CDS parameter passing, eg. "=>" with "interval 1 day"
    return {kind: "function", name: first.getFirstToken().getStr(), token: first.getFirstToken()};
  }
  if (!(first instanceof ExpressionNode) || !(first.get() instanceof CDSPrefixedName)) {
    return undefined;
  }
  const nameNode = first.getFirstChild();
  if (!(nameNode instanceof ExpressionNode)) {
    return undefined;
  }
  const path = first.getChildren().some(c => c instanceof TokenNode && c.getFirstToken().getStr() === ".");
  return {kind: path ? "path" : "entity", name: compactName(nameNode), token: nameNode.getFirstToken()};
}

/** the text of a node without spaces, eg. "/ABC/I_FOO" for a name */
export function compactName(node: ExpressionNode): string {
  return node.concatTokens().replace(/ /g, "");
}
