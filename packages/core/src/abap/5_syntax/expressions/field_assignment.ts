import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "./source";

export class FieldAssignment {

  public runSyntax(node: ExpressionNode | StatementNode, scope: CurrentScope, filename: string): void {
    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }
  }

}