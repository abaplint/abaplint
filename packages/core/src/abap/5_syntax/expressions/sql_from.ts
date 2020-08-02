import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {UnknownType} from "../../types/basic";

export class SQLFrom {

  public runSyntax(node: ExpressionNode | StatementNode, scope: CurrentScope, _filename: string): void {
    const fromList = node.findAllExpressions(Expressions.SQLFromSource);
    for (const from of fromList) {
      const dbtab = from.findFirstExpression(Expressions.DatabaseTable);
      if (dbtab === undefined) {
        continue;
      }
      const name = dbtab.getFirstToken().getStr();

      const found = scope.getDDIC().lookupTableOrView(name);
      if (found instanceof UnknownType) {
        throw new Error("Database table or view \"" + name + "\" not found, SQLFrom");
      }
    }
  }

}