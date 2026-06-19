import {altPrio, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class SQLPathJoinType extends Expression {
  public getRunnable(): IStatementRunnable {
    return altPrio(
      "EXACT ONE TO ONE",
      "ONE TO ONE",
      "MANY TO MANY",
      "MANY TO ONE",
      "ONE TO MANY",
      "LEFT OUTER",
      "RIGHT OUTER",
      "INNER",
    );
  }
}
