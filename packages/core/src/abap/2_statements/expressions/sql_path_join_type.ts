import {altPrio, seq, optPrio, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class SQLPathJoinType extends Expression {
  public getRunnable(): IStatementRunnable {
    const innerLike = altPrio("INNER", "LEFT OUTER", "RIGHT OUTER");
    const card = altPrio("EXACT ONE", "MANY", "ONE");
    const joinCard = seq(card, "TO", card);

    return altPrio(
      seq(innerLike, optPrio(joinCard)),
      joinCard,
    );
  }
}
