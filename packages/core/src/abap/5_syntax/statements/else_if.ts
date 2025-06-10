import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Cond} from "../expressions/cond";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class ElseIf implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    for (const s of node.findDirectExpressions(Expressions.Cond)) {
      Cond.runSyntax(s, input);
    }
  }
}