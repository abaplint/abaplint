import {Statement} from "./statement";
import {str, seq, alt, opt, per, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class Loop extends Statement {

  public static get_matcher(): IRunnable {
    let where = seq(str("WHERE"), alt(new Reuse.Cond(), new Reuse.Dynamic()));

    let group = seq(str("GROUP BY"), new Reuse.Source());

    let into = seq(opt(str("REFERENCE")), str("INTO"), new Reuse.Target());

    let assigning = seq(str("ASSIGNING"), new Reuse.FSTarget());

    let target = alt(seq(alt(into, assigning),
                         opt(group),
                         opt(str("CASTING"))),
                     str("TRANSPORTING NO FIELDS"));

    let from = seq(str("FROM"), new Reuse.Source());

    let to = seq(str("TO"), new Reuse.Source());

    let usingKey = seq(str("USING KEY"), alt(new Reuse.Source(), new Reuse.Dynamic()));

    let options = per(target, from, to, where, usingKey);

    let at = seq(str("AT"),
                 opt(str("GROUP")),
                 new Reuse.Source(),
                 opt(options));

    return seq(str("LOOP"), opt(at));
  }

  public isStructure() {
    return true;
  }

  public indentationEnd() {
    return 2;
  }

}