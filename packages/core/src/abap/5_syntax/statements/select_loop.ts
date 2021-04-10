import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {SelectLoop as SelectLoopExpression} from "../expressions/select_loop";

export class SelectLoop {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    const s = node.findDirectExpression(Expressions.SelectLoop);
    if (s) {
      new SelectLoopExpression().runSyntax(s, scope, filename);
    }
  }
}