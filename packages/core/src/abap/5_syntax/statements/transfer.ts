import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";

export class Transfer {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    for (const source of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(source, scope, filename);
    }

    const target = node.findDirectExpression(Expressions.Target);
    if (target) {
      new Target().runSyntax(target, scope, filename);
    }
  }
}