import {Expression, seq, stars, alt, opts, pluss} from "../combi";
import {Source, Throw, Let} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SwitchBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const or = seq("OR", Source);

    const swhen = seq("WHEN", Source, stars(or), "THEN", alt(Source, Throw));

    return seq(
      opts(Let),
      Source,
      pluss(swhen),
      opts(seq("ELSE", alt(Source, Throw))));
  }
}