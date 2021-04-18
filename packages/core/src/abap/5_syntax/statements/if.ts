import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Cond} from "../expressions/cond";
import {StatementSyntax} from "../_statement_syntax";

export class If implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    for (const s of node.findDirectExpressions(Expressions.Cond)) {
      new Cond().runSyntax(s, scope, filename);
    }
  }
}