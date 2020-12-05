import {Expression, seqs, star, alt, opt, plus} from "../combi";
import {Source, Throw, Let} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SwitchBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const or = seqs("OR", Source);

    const swhen = seqs("WHEN", Source, star(or), "THEN", alt(new Source(), new Throw()));

    return seqs(
      opt(new Let()),
      Source,
      plus(swhen),
      opt(seqs("ELSE", alt(new Source(), new Throw()))));
  }
}