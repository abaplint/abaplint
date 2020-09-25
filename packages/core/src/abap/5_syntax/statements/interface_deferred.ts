import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";

export class InterfaceDeferred {
  public runSyntax(node: StatementNode, scope: CurrentScope, _filename: string): void {
    const name = node.findFirstExpression(Expressions.InterfaceName)?.getFirstToken();
    scope.addDeferred(name);
  }
}