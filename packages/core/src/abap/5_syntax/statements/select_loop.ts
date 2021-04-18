import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {SelectLoop as SelectLoopExpression} from "../expressions/select_loop";
import {StatementSyntax} from "../_statement_syntax";

export class SelectLoop implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    const s = node.findDirectExpression(Expressions.SelectLoop);
    if (s) {
      new SelectLoopExpression().runSyntax(s, scope, filename);
    }
  }
}