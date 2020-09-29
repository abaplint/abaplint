import {IStatement} from "./_statement";
import {str, seq, alt, opt, altPrio, optPrio, plus, per} from "../combi";
import {Field, Source, Dynamic, FieldSub, ComponentChain, ReadTableTarget} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ReadTable implements IStatement {

  public getMatcher(): IStatementRunnable {
    const comparing = seq(str("COMPARING"), alt(plus(new FieldSub()), new Dynamic()));

    const index = seq(str("INDEX"), new Source());

    const compare = seq(altPrio(new ComponentChain(), new Dynamic()),
                        str("="),
                        new Source());

    const components = seq(alt(new Field(), new Dynamic()), str("COMPONENTS"), plus(compare));

    const key = seq(altPrio(str("WITH KEY"), str("WITH TABLE KEY")),
                    alt(plus(compare),
                        components,
                        seq(optPrio(str("=")), new Source())));

    const using = seq(str("USING KEY"), alt(new Field(), new Dynamic()));

    const from = seq(str("FROM"), new Source());

    const perm = per(alt(index,
                         key,
                         from),
                     new ReadTableTarget(),
                     using,
                     comparing,
                     str("CASTING"),
                     str("TRANSPORTING ALL FIELDS"),
                     seq(str("TRANSPORTING"), altPrio(new Dynamic(), plus(new Field()))),
                     str("BINARY SEARCH"));

    return seq(str("READ TABLE"),
               new Source(),
               opt(perm));
  }

}