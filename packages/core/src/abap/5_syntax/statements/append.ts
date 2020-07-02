import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {TableType} from "../../types/basic";

export class Append {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    const target = node.findDirectExpression(Expressions.Target);
    if (target === undefined) {
      throw new Error("Append, expected target");
    }
    const targetType = new Target().runSyntax(target, scope, filename);
    if (!(targetType instanceof TableType)) {
      throw new Error("Append, target not a table type");
    }

    let source = node.findDirectExpression(Expressions.Source);
    if (source === undefined) {
      source = node.findDirectExpression(Expressions.SimpleSource);
    }
    if (source === undefined) {
      throw new Error("Append, expected soure");
    }

    new Source().runSyntax(source, scope, filename, targetType.getRowType());

    const from = node.findExpressionAfterToken("FROM");
    if (from && from.get() instanceof Expressions.Source) {
      new Source().runSyntax(from, scope, filename);
    }
    const to = node.findExpressionAfterToken("TO");
    if (to && to.get() instanceof Expressions.Source) {
      new Source().runSyntax(to, scope, filename);
    }

  }
}