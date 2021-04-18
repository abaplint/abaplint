import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Select as SelectExpression} from "../expressions/select";
import {StatementSyntax} from "../_statement_syntax";

export class Select implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    const s = node.findDirectExpression(Expressions.Select);
    if (s) {
      new SelectExpression().runSyntax(s, scope, filename);
    }

  }
}