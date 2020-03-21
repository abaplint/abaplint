import {Expression, IStatementRunnable, seq, str, star, alt, opt, plus} from "../combi";
import {Source, Throw, Let} from ".";

export class SwitchBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const or = seq(str("OR"), new Source());

    const swhen = seq(str("WHEN"), new Source(), star(or), str("THEN"), alt(new Source(), new Throw()));

    return seq(
      opt(new Let()),
      new Source(),
      plus(swhen),
      opt(seq(str("ELSE"), alt(new Source(), new Throw()))));
  }
}