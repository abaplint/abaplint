import {Expression, IStatementRunnable, seq, opt, str} from "../combi";
import {Source, SimpleName, ComponentCond} from ".";

export class FilterBody extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(
      new Source(),
      opt(str("EXCEPT")),
      opt(seq(str("IN"), new Source())),
      opt(seq(str("USING KEY"), new SimpleName())),
      seq(str("WHERE"), new ComponentCond()));
  }
}