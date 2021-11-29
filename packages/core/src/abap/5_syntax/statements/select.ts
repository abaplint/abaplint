import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Select as SelectExpression} from "../expressions/select";
import {StatementSyntax} from "../_statement_syntax";

export class Select implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    const selects = node.findDirectExpressions(Expressions.Select);
    for (let i = 0; i < selects.length; i++) {
      const last = i === selects.length - 1;
      const s = selects[i];
      new SelectExpression().runSyntax(s, scope, filename, last === false);
    }


  }
}