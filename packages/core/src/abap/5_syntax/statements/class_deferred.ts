import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {DeferredType} from "../_spaghetti_scope";

export class ClassDeferred {
  public runSyntax(node: StatementNode, scope: CurrentScope, _filename: string): void {
    const name = node.findFirstExpression(Expressions.ClassName)?.getFirstToken().getStr();
    scope.addDeferred(name, DeferredType.Class);
  }
}