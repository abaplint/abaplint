import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {InlineData} from "../expressions/inline_data";

export class Move {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    const target = node.findDirectExpression(Expressions.Target);
    const targetType = target ? new Target().runSyntax(target, scope, filename) : undefined;

    const source = node.findDirectExpression(Expressions.Source);
    const sourceType = source ? new Source().runSyntax(source, scope, filename, targetType) : undefined;

    const inline = target?.findDirectExpression(Expressions.InlineData);
    if (inline) {
      new InlineData().runSyntax(inline, scope, filename, sourceType);
    }
  }
}