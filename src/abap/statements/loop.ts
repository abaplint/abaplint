import {Statement} from "./statement";
import {str, seq, alt, opt, per, IRunnable} from "../combi";
import {FSTarget, Target, Cond, Dynamic, Source} from "../expressions";

export class Loop extends Statement {

  public get_matcher(): IRunnable {
    let where = seq(str("WHERE"), alt(new Cond(), new Dynamic()));

    let group = seq(str("GROUP BY"), new Source());

    let into = seq(opt(str("REFERENCE")), str("INTO"), new Target());

    let assigning = seq(str("ASSIGNING"), new FSTarget());

    let target = alt(seq(alt(into, assigning),
                         opt(group),
                         opt(str("CASTING"))),
                     str("TRANSPORTING NO FIELDS"));

    let from = seq(str("FROM"), new Source());

    let to = seq(str("TO"), new Source());

    let usingKey = seq(str("USING KEY"), alt(new Source(), new Dynamic()));

    let options = per(target, from, to, where, usingKey);

    let at = seq(str("AT"),
                 opt(str("GROUP")),
                 new Source(),
                 opt(options));

    return seq(str("LOOP"), opt(at));
  }

}