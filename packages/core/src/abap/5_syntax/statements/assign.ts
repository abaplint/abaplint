import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {FSTarget} from "../expressions/fstarget";

export class Assign {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    const sources = node.findDirectExpressions(Expressions.Source);
    const firstSource = sources[0];
    const sourceType = firstSource ? new Source().runSyntax(firstSource, scope, filename) : undefined;

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