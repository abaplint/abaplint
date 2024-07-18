import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {Dynamic} from "../expressions/dynamic";
import {DatabaseTable} from "../expressions/database_table";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class DeleteDatabase implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    for (const s of node.findAllExpressions(Expressions.Source)) {
      new Source().runSyntax(s, input);
    }
    for (const s of node.findAllExpressions(Expressions.SimpleSource3)) {
      new Source().runSyntax(s, input);
    }

    for (const d of node.findAllExpressions(Expressions.Dynamic)) {
      new Dynamic().runSyntax(d, input);
    }

    const dbtab = node.findFirstExpression(Expressions.DatabaseTable);
    if (dbtab !== undefined) {
      new DatabaseTable().runSyntax(dbtab, input);
    }

  }
}