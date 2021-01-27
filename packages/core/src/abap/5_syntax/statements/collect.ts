import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {FSTarget} from "../expressions/fstarget";
import {Target} from "../expressions/target";

export class Collect {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    const source = node.findDirectExpression(Expressions.Source);
    if (source) {
      new Source().runSyntax(source, scope, filename);
    }

    const target = node.findDirectExpression(Expressions.Target);
    if (target) {
      new Target().runSyntax(target, scope, filename);
    }

    const fs = node.findDirectExpression(Expressions.FSTarget);
    if (fs) {
      new FSTarget().runSyntax(fs, scope, filename, undefined);
    }
  }
}