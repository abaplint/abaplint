import {Visibility} from "./visibility";
import {StatementNode} from "../nodes";
import {Constant} from "./constant";

export class ClassConstant extends Constant {
  private visibility: Visibility;

  constructor(node: StatementNode, visibility: Visibility) {
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
    this.visibility = visibility;
  }

  public getVisibility() {
    return this.visibility;
  }

}