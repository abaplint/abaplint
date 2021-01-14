import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {VoidType, TableType} from "../../types/basic";
import {Source} from "../expressions/source";
import {InlineData} from "../expressions/inline_data";
import {Target} from "../expressions/target";
import {FSTarget} from "../expressions/fstarget";
import {ComponentCompareSimple} from "../expressions/component_compare_simple";

export class ReadTable {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    const sources = node.findDirectExpressions(Expressions.Source);

    const components = node.findDirectExpression(Expressions.ComponentCompareSimple);
    if (components !== undefined) {
      new ComponentCompareSimple().runSyntax(components, scope, filename);
    }

    let firstSource = node.findDirectExpression(Expressions.SimpleSource2);
    if (firstSource === undefined) {
      firstSource = sources[0];
    }
    let sourceType = firstSource ? new Source().runSyntax(firstSource, scope, filename) : undefined;

    if (sourceType === undefined) {
      throw new Error("No source type determined, read table");
    } else if (!(sourceType instanceof TableType) && !(sourceType instanceof VoidType)) {
      throw new Error("Read table, not a table type");
    }

    if (sourceType instanceof TableType) {
      sourceType = sourceType.getRowType();
    }

    for (const s of sources) {
      if (s === firstSource) {
        continue;
      }
      new Source().runSyntax(s, scope, filename);
    }

    const target = node.findDirectExpression(Expressions.ReadTableTarget);
    if (target) {
      const inline = target.findFirstExpression(Expressions.InlineData);
      if (inline) {
        new InlineData().runSyntax(inline, scope, filename, sourceType);
        return;
      }

      const fst = target.findDirectExpression(Expressions.FSTarget);
      if (fst) {
        new FSTarget().runSyntax(fst, scope, filename, sourceType);
        return;
      }
/*
      const inlinefs = target.findFirstExpression(Expressions.InlineFS);
      if (inlinefs) {
        new InlineFS().runSyntax(inlinefs, scope, filename, sourceType);
        return;
      }
*/

      const t = target.findFirstExpression(Expressions.Target);
      if (t) {
        new Target().runSyntax(t, scope, filename);
        return;
      }
    }
  }
}