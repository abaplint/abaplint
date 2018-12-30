import {Scope} from "./scope";
import {StatementNode} from "../nodes";
import {Constant} from "./constant";

export class ClassConstant extends Constant {
  private scope: Scope;

  constructor(node: StatementNode, scope: Scope) {
    /*
    if (!(node.get() instanceof Statements.Constant)) {
      throw new Error("Constant, unexpected node");
    }
    const found = node.findFirstExpression(Expressions.NamespaceSimpleName);
    if (found === undefined) {
      throw new Error("Constant, unexpected node");
    }
    const token = found.getFirstToken();
*/
    super(node);
    this.scope = scope;
  }

  public getScope() {
    return this.scope;
  }

}