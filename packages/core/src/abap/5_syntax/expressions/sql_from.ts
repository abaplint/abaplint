import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {Dynamic} from "./dynamic";
import {DatabaseTable, DatabaseTableSource} from "./database_table";
import {SyntaxInput} from "../_syntax_input";

export class SQLFrom {

  public static runSyntax(node: ExpressionNode | StatementNode, input: SyntaxInput): DatabaseTableSource[] {
    const ret: DatabaseTableSource[] = [];
    const fromList = node.findAllExpressions(Expressions.SQLFromSource);
    for (const from of fromList) {
      for (const d of from.findAllExpressions(Expressions.Dynamic)) {
        Dynamic.runSyntax(d, input);
      }

      const dbtab = from.findFirstExpression(Expressions.DatabaseTable);
      if (dbtab !== undefined) {
        ret.push(DatabaseTable.runSyntax(dbtab, input));
      }
    }
    return ret;
  }

}