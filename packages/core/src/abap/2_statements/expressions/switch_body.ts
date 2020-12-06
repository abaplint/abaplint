import {Expression, seq, stars, alt, opt, pluss} from "../combi";
import {Source, Throw, Let} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SwitchBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const or = seq("OR", Source);

    const swhen = seq("WHEN", Source, stars(or), "THEN", alt(Source, Throw));

    return seq(
      opt(Let),
      Source,
      pluss(swhen),
      opt(seq("ELSE", alt(Source, Throw))));
  }
}