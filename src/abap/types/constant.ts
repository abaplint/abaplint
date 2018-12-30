import * as Statements from "../statements";
import * as Expressions from "../expressions";
import {StatementNode} from "../nodes";
import {TypedIdentifier} from "./_typed_identifier";

export class Constant extends TypedIdentifier {

  constructor(node: StatementNode) {
    if (!(node.get() instanceof Statements.Constant)) {
      throw new Error("Constant, unexpected node");
    }
    const found = node.findFirstExpression(Expressions.NamespaceSimpleName);
    if (found === undefined) {
      throw new Error("Constant, unexpected node");
    }
    const token = found.getFirstToken();

    super(token, node);
  }

}