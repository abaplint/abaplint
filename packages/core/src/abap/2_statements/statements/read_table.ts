import {IStatement} from "./_statement";
import {seq, alt, opt, altPrio, optPrio, plus, per, ver} from "../combi";
import {Field, Source, Dynamic, FieldSub, ComponentChain, ReadTableTarget, BasicSource} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class ReadTable implements IStatement {

  public getMatcher(): IStatementRunnable {
    const comparing = seq("COMPARING", alt(plus(FieldSub), Dynamic));

    const index = seq("INDEX", Source);

    const compare = seq(altPrio(ComponentChain, Dynamic),
                        "=",
                        Source);

    const components = seq(alt(Field, Dynamic), "COMPONENTS", plus(compare));

    const key = seq(altPrio("WITH KEY", "WITH TABLE KEY"),
                    alt(plus(compare),
                        components,
                        seq(optPrio("="), Source)));

    const using = seq("USING KEY", alt(Field, Dynamic));

    const from = seq("FROM", Source);

    const perm = per(alt(index, key, from),
                     ReadTableTarget,
                     using,
                     comparing,
                     "CASTING",
                     "TRANSPORTING ALL FIELDS",
                     seq("TRANSPORTING", altPrio(Dynamic, plus(Field))),
                     "BINARY SEARCH");

    return seq("READ TABLE",
               alt(ver(Version.v740sp02, Source), BasicSource),
               opt(perm));
  }

}