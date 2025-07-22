import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";
import {SQLSource} from "../expressions/sql_source";

export class CloseCursor implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    for (const t of node.findAllExpressions(Expressions.SQLSourceSimple)) {
      SQLSource.runSyntax(t, input);
    }

  }
}