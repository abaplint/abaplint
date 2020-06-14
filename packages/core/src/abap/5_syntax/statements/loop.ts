import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {VoidType, TableType} from "../../types/basic";
import {Target} from "../expressions/target";
import {Source} from "../expressions/source";
import {InlineData} from "../expressions/inline_data";
import {InlineFS} from "../expressions/inline_fs";

export class Loop {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    let target = node.findDirectExpression(Expressions.Target);
    const targetType = target ? new Target().runSyntax(target, scope, filename) : undefined;
    if (target === undefined) {
      target = node.findDirectExpression(Expressions.FSTarget);
    }

    const source = node.findDirectExpression(Expressions.Source);
    let sourceType = source ? new Source().runSyntax(source, scope, filename, targetType) : undefined;

    if (sourceType === undefined) {
      throw new Error("No source type determined");
    } else if (!(sourceType instanceof TableType) && !(sourceType instanceof VoidType)) {
      throw new Error("Loop, not a table type");
    }

    if (sourceType instanceof TableType) {
      sourceType = sourceType.getRowType();
    }

    const inline = target?.findDirectExpression(Expressions.InlineData);
    if (inline) {
      new InlineData().runSyntax(inline, scope, filename, sourceType);
    }

    const inlinefs = target?.findDirectExpression(Expressions.InlineFS);
    if (inlinefs) {
      new InlineFS().runSyntax(inlinefs, scope, filename, sourceType);
    }

  }
}