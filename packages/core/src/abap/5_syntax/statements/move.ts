import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {InlineData} from "../expressions/inline_data";
import {AbstractType} from "../../types/basic/_abstract_type";

export class Move {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    const target = node.findDirectExpression(Expressions.Target);
    const inline = target?.findDirectExpression(Expressions.InlineData);

    let targetType: AbstractType | undefined = undefined;
    if (inline === undefined) {
      targetType = target ? new Target().runSyntax(target, scope, filename) : undefined;
    }

    const source = node.findDirectExpression(Expressions.Source);
    const sourceType = source ? new Source().runSyntax(source, scope, filename, targetType) : undefined;

    if (sourceType === undefined) {
      throw new Error("No source type determined");
    }

    if (inline) {
      new InlineData().runSyntax(inline, scope, filename, sourceType);
    }
  }
}