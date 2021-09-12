import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {FSTarget} from "../expressions/fstarget";
import {Dynamic} from "../expressions/dynamic";
import {VoidType} from "../../types/basic";
import {StatementSyntax} from "../_statement_syntax";

export class Assign implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    const sources = node.findDirectExpressions(Expressions.Source);
    const firstSource = sources[0];
    let sourceType = new Source().runSyntax(firstSource, scope, filename);

    if (sourceType === undefined || node.findDirectExpression(Expressions.Dynamic)) {
      sourceType = new VoidType("DynamicAssign");
    }

    for (const d of node.findAllExpressions(Expressions.Dynamic)) {
      new Dynamic().runSyntax(d, scope, filename);
    }

    const target = node.findDirectExpression(Expressions.FSTarget);
    if (target) {
      new FSTarget().runSyntax(target, scope, filename, sourceType);
    }

    for (const s of sources) {
      if (s === firstSource) {
        continue;
      }
      new Source().runSyntax(s, scope, filename);
    }

  }
}