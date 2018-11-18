import {Scope} from "./scope";
import {Attribute} from "./attribute";
import * as Statements from "../statements";
import * as Expressions from "../expressions";
import {StatementNode} from "../nodes";

export class ClassAttribute extends Attribute {
  private scope: Scope;
//  private readOnly: boolean;

  constructor(node: StatementNode, scope: Scope) {
    if (!(node.get() instanceof Statements.Data) && !(node.get() instanceof Statements.ClassData)) {
      throw new Error("ClassAttribute, unexpected node");
    }
    const found = node.findFirstExpression(Expressions.NamespaceSimpleName);
    if (found === undefined) {
      throw new Error("ClassAttribute, unexpected node");
    }
    const token = found.getFirstToken().get();

    super(token.getStr(), token.getPos());
    this.scope = scope;
//    this.readOnly = undefined;
  }

  public getScope() {
    return this.scope;
  }
/*
  public isReadOnly() {
    return this.readOnly;
  }
*/

}