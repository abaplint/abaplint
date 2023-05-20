import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {DatabaseTableSource} from "./database_table";
import {SQLSource} from "./sql_source";

export class SQLCompare {

  public runSyntax(node: ExpressionNode | StatementNode, scope: CurrentScope, filename: string, _tables: DatabaseTableSource[]): void {

    for (const s of node.findAllExpressions(Expressions.SQLSource)) {
      new SQLSource().runSyntax(s, scope, filename);
    }
  }

}