import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "./source";

export class SQLSource {

  public runSyntax(node: ExpressionNode | StatementNode, scope: CurrentScope, filename: string): void {
    for (const s of node.findAllExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }
    for (const s of node.findAllExpressions(Expressions.SimpleSource3)) {
      new Source().runSyntax(s, scope, filename);
    }
  }

}