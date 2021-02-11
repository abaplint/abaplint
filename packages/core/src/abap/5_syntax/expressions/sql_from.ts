import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Dynamic} from "./dynamic";
import {DatabaseTable} from "./database_table";

export class SQLFrom {

  public runSyntax(node: ExpressionNode | StatementNode, scope: CurrentScope, filename: string): void {
    const fromList = node.findAllExpressions(Expressions.SQLFromSource);
    for (const from of fromList) {
      for (const d of from.findAllExpressions(Expressions.Dynamic)) {
        new Dynamic().runSyntax(d, scope, filename);
      }

      const dbtab = from.findFirstExpression(Expressions.DatabaseTable);
      if (dbtab !== undefined) {
        new DatabaseTable().runSyntax(dbtab, scope, filename);
      }
    }
  }

}