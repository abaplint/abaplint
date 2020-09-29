import {Expression, seq, optPrio, str} from "../combi";
import {Source, SimpleName, ComponentCond} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FilterBody extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(
      new Source(),
      optPrio(str("EXCEPT")),
      optPrio(seq(str("IN"), new Source())),
      optPrio(seq(str("USING KEY"), new SimpleName())),
      seq(str("WHERE"), new ComponentCond()));
  }
}