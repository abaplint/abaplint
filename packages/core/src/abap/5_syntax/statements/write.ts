import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";
import {Dynamic} from "../expressions/dynamic";
import {TypeUtils} from "../_type_utils";

export class Write implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

// todo, more

    const second = node.getChildren()[1];
    for (const s of node.findAllExpressions(Expressions.Source)) {
      const type = new Source().runSyntax(s, scope, filename);
      if (s === second
          && new TypeUtils().isCharLike(type) === false
          && new TypeUtils().isHexLike(type) === false) {
        throw new Error("Source not character like");
      }
    }

    for (const s of node.findAllExpressions(Expressions.Dynamic)) {
      new Dynamic().runSyntax(s, scope, filename);
    }

    const target = node.findDirectExpression(Expressions.Target);
    if (target) {
      new Target().runSyntax(target, scope, filename);
    }

  }
}