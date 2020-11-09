import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {VoidType, TableType, UnknownType, DataReference} from "../../types/basic";
import {Target} from "../expressions/target";
import {Source} from "../expressions/source";
import {InlineData} from "../expressions/inline_data";
import {InlineFS} from "../expressions/inline_fs";
import {FSTarget} from "../expressions/fstarget";
import {ComponentCompare} from "../expressions/component_compare";
import {ComponentCond} from "../expressions/component_cond";
import {Dynamic} from "../expressions/dynamic";

export class Loop {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    let target = node.findDirectExpression(Expressions.Target);
    const targetType = target ? new Target().runSyntax(target, scope, filename) : undefined;
    if (target === undefined) {
      target = node.findDirectExpression(Expressions.FSTarget);
    }

    const sources = node.findDirectExpressions(Expressions.Source);
    let firstSource = node.findDirectExpression(Expressions.BasicSource);
    if (firstSource === undefined) {
      firstSource = sources[0];
    }
    let sourceType = firstSource ? new Source().runSyntax(firstSource, scope, filename, targetType) : undefined;

    if (sourceType === undefined) {
      throw new Error("No source type determined");
    } else if (sourceType instanceof UnknownType) {
      throw new Error("Loop, not a table type, " + sourceType.getError());
    } else if (!(sourceType instanceof TableType) && !(sourceType instanceof VoidType)) {
      throw new Error("Loop, not a table type");
    }

    if (sourceType instanceof TableType) {
      sourceType = sourceType.getRowType();
      if (node.concatTokens().toUpperCase().includes(" REFERENCE INTO ")) {
        sourceType = new DataReference(sourceType);
      }
    }

    const inline = target?.findDirectExpression(Expressions.InlineData);
    if (inline) {
      new InlineData().runSyntax(inline, scope, filename, sourceType);
    }

    for (const s of sources) {
      if (s === firstSource) {
        continue;
      }
      new Source().runSyntax(s, scope, filename);
    }

    const inlinefs = target?.findDirectExpression(Expressions.InlineFS);
    if (inlinefs) {
      new InlineFS().runSyntax(inlinefs, scope, filename, sourceType);
    } else {
      const fstarget = node.findDirectExpression(Expressions.FSTarget);
      if (fstarget) {
        new FSTarget().runSyntax(fstarget, scope, filename, sourceType);
      }
    }

    for (const t of node.findDirectExpressions(Expressions.ComponentCompare)) {
      new ComponentCompare().runSyntax(t, scope, filename);
    }

    for (const t of node.findDirectExpressions(Expressions.ComponentCond)) {
      new ComponentCond().runSyntax(t, scope, filename);
    }

    for (const t of node.findDirectExpressions(Expressions.Dynamic)) {
      new Dynamic().runSyntax(t, scope, filename);
    }

  }
}