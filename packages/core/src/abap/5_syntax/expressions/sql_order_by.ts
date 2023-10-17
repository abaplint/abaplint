import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Dynamic} from "./dynamic";

export class SQLOrderBy {

  public runSyntax(node: ExpressionNode | StatementNode, scope: CurrentScope, filename: string): void {
    const dyn = node.findDirectExpression(Expressions.Dynamic);
    if (dyn) {
      new Dynamic().runSyntax(dyn, scope, filename);
    }
  }

}