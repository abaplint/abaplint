import {Statement} from "./_statement";
import {str, seq, alt, opt, per, IStatementRunnable} from "../combi";
import {FSTarget, Target, ComponentCond, Dynamic, Source} from "../expressions";

export class Loop extends Statement {

  public getMatcher(): IStatementRunnable {
    const where = seq(str("WHERE"), alt(new ComponentCond(), new Dynamic()));

    const group = seq(str("GROUP BY"), new Source());

    const into = seq(opt(str("REFERENCE")), str("INTO"), new Target());

    const assigning = seq(str("ASSIGNING"), new FSTarget());

    const target = alt(seq(alt(into, assigning),
                           opt(group),
                           opt(str("CASTING"))),
                       str("TRANSPORTING NO FIELDS"));

    const from = seq(str("FROM"), new Source());

    const to = seq(str("TO"), new Source());

    const usingKey = seq(str("USING KEY"), alt(new Source(), new Dynamic()));

    const options = per(target, from, to, where, usingKey);

    const at = seq(str("AT"),
                   opt(str("GROUP")),
                   new Source(),
                   opt(options));

    return seq(str("LOOP"), opt(at));
  }

}