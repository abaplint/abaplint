import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {StatementSyntax} from "../_statement_syntax";
import {Target} from "../expressions/target";
import {TypeUtils} from "../_type_utils";

export class Shift implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

    const target = node.findDirectExpression(Expressions.Target);
    if (target === undefined) {
      throw new Error("Shift, Target not found");
    }

    const targetType = new Target().runSyntax(target, scope, filename);
    if (node.concatTokens().toUpperCase().includes(" IN BYTE MODE")) {
      if (TypeUtils.isHexLike(targetType) === false) {
        throw new Error("Shift, Target not hex like");
      }
    } else {
      if (TypeUtils.isCharLike(targetType) === false) {
        throw new Error("Shift, Target not char like");
      }
    }

  }
}