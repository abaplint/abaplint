import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Dynamic} from "../expressions/dynamic";
import {DatabaseTable} from "../expressions/database_table";

export class ModifyDatabase {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    for (const d of node.findAllExpressions(Expressions.Dynamic)) {
      new Dynamic().runSyntax(d, scope, filename);
    }

    const dbtab = node.findFirstExpression(Expressions.DatabaseTable);
    if (dbtab !== undefined) {
      new DatabaseTable().runSyntax(dbtab, scope, filename);
    }
  }
}