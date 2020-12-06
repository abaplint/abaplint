import {Expression, seq, stars, alts, opts, pluss} from "../combi";
import {Source, Throw, Let} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SwitchBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const or = seq("OR", Source);

    const swhen = seq("WHEN", Source, stars(or), "THEN", alts(Source, Throw));

    return seq(
      opts(Let),
      Source,
      pluss(swhen),
      opts(seq("ELSE", alts(Source, Throw))));
  }
}