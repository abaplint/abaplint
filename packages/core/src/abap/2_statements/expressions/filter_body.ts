import {Expression, seq, per, optPrio, str} from "../combi";
import {Source, SimpleName, ComponentCond} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FilterBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const inn = seq(str("IN"), new Source());
    const using = seq(str("USING KEY"), new SimpleName());
    return seq(
      new Source(),
      optPrio(str("EXCEPT")),
      optPrio(per(inn, using)),
      seq(str("WHERE"), new ComponentCond()));
  }
}