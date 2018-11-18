import {Statement} from "./_statement";
import {str, seq, alt, opt, optPrio, plus, per, IRunnable} from "../combi";
import {FSTarget, Target, Field, Source, Dynamic, FieldSub} from "../expressions";

export class Read extends Statement {

  public getMatcher(): IRunnable {
    const comparing = seq(str("COMPARING"), plus(new FieldSub()));

    const target = alt(seq(str("ASSIGNING"), new FSTarget()),
                       seq(opt(str("REFERENCE")), str("INTO"), new Target()),
                       str("TRANSPORTING NO FIELDS"));

    const index = seq(str("INDEX"), new Source());

    const compare = seq(alt(new Target(), new Dynamic()),
                        str("="),
                        new Source());

    const components = seq(alt(new Field(), new Dynamic()), str("COMPONENTS"), plus(compare));

    const key = seq(alt(str("WITH KEY"), str("WITH TABLE KEY")),
                    alt(plus(compare),
                        components,
                        seq(optPrio(str("=")), new Source())));

    const using = seq(str("USING KEY"), alt(new Field(), new Dynamic()));

    const from = seq(str("FROM"), new Source());

    const perm = per(alt(index,
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