import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {InlineFS} from "../expressions/inline_fs";

export class Assign {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    const target = node.findDirectExpression(Expressions.FSTarget);

    const source = node.findDirectExpression(Expressions.Source);
    const sourceType = source ? new Source().runSyntax(source, scope, filename) : undefined;

    const inlinefs = target?.findDirectExpression(Expressions.InlineFS);
    if (inlinefs) {
      new InlineFS().runSyntax(inlinefs, scope, filename, sourceType);
    }

  }
}