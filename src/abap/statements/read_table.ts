import {Statement} from "./statement";
import {str, seq, alt, opt, optPrio, plus, per, IRunnable} from "../combi";
import {FSTarget, Target, Field, Source, Dynamic, FieldSub} from "../expressions";

export class Read extends Statement {

  public static get_matcher(): IRunnable {
    let comparing = seq(str("COMPARING"), plus(new FieldSub()));

    let target = alt(seq(str("ASSIGNING"), new FSTarget()),
                     seq(opt(str("REFERENCE")), str("INTO"), new Target()),
                     str("TRANSPORTING NO FIELDS"));

    let index = seq(str("INDEX"), new Source());

    let compare = seq(alt(new Target(), new Dynamic()),
                      str("="),
                      new Source());

    let components = seq(alt(new Field(), new Dynamic()), str("COMPONENTS"), plus(compare));

    let key = seq(alt(str("WITH KEY"), str("WITH TABLE KEY")),
                  alt(plus(compare),
                      components,
                      seq(optPrio(str("=")), new Source())));

    let using = seq(str("USING KEY"), alt(new Field(), new Dynamic()));

    let from = seq(str("FROM"), new Source());

    let perm = per(alt(index,
                       key,
                       from),
                   target,
                   using,
                   comparing,
                   str("CASTING"),
                   seq(str("TRANSPORTING"), plus(new Field())),
                   str("BINARY SEARCH"));

    return seq(str("READ TABLE"),
               new Source(),
               opt(perm));
  }

}