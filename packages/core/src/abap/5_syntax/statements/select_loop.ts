import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Select} from "../expressions/select";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class SelectLoop implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const s = node.findDirectExpression(Expressions.Select);
    if (s) {
      Select.runSyntax(s, input);
    }
  }
}