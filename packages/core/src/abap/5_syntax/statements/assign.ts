import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {FSTarget} from "../expressions/fstarget";
import {Dynamic} from "../expressions/dynamic";
import {AnyType} from "../../types/basic";
import {StatementSyntax} from "../_statement_syntax";

export class Assign implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    const sources = node.findDirectExpression(Expressions.AssignSource)?.findDirectExpressions(Expressions.Source) || [];
    const theSource = sources[sources.length - 1];
    let sourceType = new Source().runSyntax(theSource, scope, filename);

    if (sourceType === undefined || node.findDirectExpression(Expressions.AssignSource)?.findDirectExpression(Expressions.Dynamic)) {
      sourceType = new AnyType();
    }
    for (const d of node.findDirectExpression(Expressions.AssignSource)?.findAllExpressions(Expressions.Dynamic) || []) {
      new Dynamic().runSyntax(d, scope, filename);
    }

    const target = node.findDirectExpression(Expressions.FSTarget);
    if (target) {
      new FSTarget().runSyntax(target, scope, filename, sourceType);
    }

    for (const s of node.findAllExpressions(Expressions.Source)) {
      if (s === theSource) {
        continue;
      }
      new Source().runSyntax(s, scope, filename);
    }

  }
}