import {IStatement} from "./_statement";
import {str, seqs, alt, opt, altPrio, optPrio, plus, per, ver} from "../combi";
import {Field, Source, Dynamic, FieldSub, ComponentChain, ReadTableTarget, BasicSource} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class ReadTable implements IStatement {

  public getMatcher(): IStatementRunnable {
    const comparing = seqs("COMPARING", alt(plus(new FieldSub()), new Dynamic()));

    const index = seqs("INDEX", Source);

    const compare = seqs(altPrio(new ComponentChain(), new Dynamic()),
                         "=",
                         Source);

    const components = seqs(alt(new Field(), new Dynamic()), "COMPONENTS", plus(compare));

    const key = seqs(altPrio(str("WITH KEY"), str("WITH TABLE KEY")),
                     alt(plus(compare),
                         components,
                         seqs(optPrio(str("=")), Source)));

    const using = seqs("USING KEY", alt(new Field(), new Dynamic()));

    const from = seqs("FROM", Source);

    const perm = per(alt(index,
                         key,
                         from),
                     new ReadTableTarget(),
                     using,
                     comparing,
                     str("CASTING"),
                     str("TRANSPORTING ALL FIELDS"),
                     seqs("TRANSPORTING", altPrio(new Dynamic(), plus(new Field()))),
                     str("BINARY SEARCH"));

    return seqs("READ TABLE",
                alt(ver(Version.v740sp02, new Source()), new BasicSource()),
                opt(perm));
  }

}