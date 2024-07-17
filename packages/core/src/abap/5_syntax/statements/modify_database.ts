import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Dynamic} from "../expressions/dynamic";
import {DatabaseTable} from "../expressions/database_table";
import {StatementSyntax} from "../_statement_syntax";
import {Source} from "../expressions/source";
import {ReferenceType} from "../_reference";
import {SyntaxInput} from "../_syntax_input";

export class ModifyDatabase implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    for (const d of node.findAllExpressions(Expressions.Dynamic)) {
      new Dynamic().runSyntax(d, input);
    }

    const dbtab = node.findFirstExpression(Expressions.DatabaseTable);
    if (dbtab !== undefined) {
      if (node.getChildren().length === 5) {
        const found = input.scope.findVariable(dbtab.concatTokens());
        if (found) {
          input.scope.addReference(dbtab.getFirstToken(), found, ReferenceType.DataWriteReference, input.filename);
        } else {
          new DatabaseTable().runSyntax(dbtab, input);
        }
      } else {
        new DatabaseTable().runSyntax(dbtab, input);
      }
    }

    for (const s of node.findAllExpressions(Expressions.Source)) {
      new Source().runSyntax(s, input);
    }
    for (const s of node.findAllExpressions(Expressions.SimpleSource3)) {
      new Source().runSyntax(s, input);
    }
  }
}