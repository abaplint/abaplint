import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {SelectLoop as SelectLoopExpression} from "../expressions/select_loop";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class SelectLoop implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const s = node.findDirectExpression(Expressions.SelectLoop);
    if (s) {
      new SelectLoopExpression().runSyntax(s, input);
    }
  }
}