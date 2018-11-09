import {Scope} from "./scope";
import {Attribute} from "./attribute";
import * as Statements from "../statements";
import * as Expressions from "../expressions";
import {StatementNode} from "../nodes";

export class ClassAttribute extends Attribute {
  private scope: Scope;
  private readOnly: boolean;

  constructor(node: StatementNode, scope: Scope) {
    if (!(node.get() instanceof Statements.Data)) {
      throw new Error("ClassAttribute, unexpected node");
    }

    let name = node.findFirstExpression(Expressions.NamespaceSimpleName).getFirstToken().get().getStr();

    super(name);
    this.scope = scope;
    this.readOnly = undefined;

  }

  public getScope() {
    return this.scope;
  }

  public isReadOnly() {
    return this.readOnly;
  }


}