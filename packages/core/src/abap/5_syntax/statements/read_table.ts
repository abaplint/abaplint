import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {VoidType, TableType} from "../../types/basic";
import {Source} from "../expressions/source";
import {InlineData} from "../expressions/inline_data";
import {InlineFS} from "../expressions/inline_fs";
import {Target} from "../expressions/target";

export class ReadTable {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    const source = node.findDirectExpression(Expressions.Source);
    let sourceType = source ? new Source().runSyntax(source, scope, filename) : undefined;

    if (sourceType === undefined) {
      throw new Error("No source type determined, read table");
    } else if (!(sourceType instanceof TableType) && !(sourceType instanceof VoidType)) {
      throw new Error("Read table, not a table type");
    }

    if (sourceType instanceof TableType) {
      sourceType = sourceType.getRowType();
    }

    const target = node.findDirectExpression(Expressions.ReadTableTarget);
    if (target) {
      const inline = target.findFirstExpression(Expressions.InlineData);
      if (inline) {
        new InlineData().runSyntax(inline, scope, filename, sourceType);
        return;
      }
      const inlinefs = target.findFirstExpression(Expressions.InlineFS);
      if (inlinefs) {
        new InlineFS().runSyntax(inlinefs, scope, filename, sourceType);
        return;
      }
      const t = target.findFirstExpression(Expressions.Target);
      if (t) {
        new Target().runSyntax(t, scope, filename);
        return;
      }
    }
  }
}