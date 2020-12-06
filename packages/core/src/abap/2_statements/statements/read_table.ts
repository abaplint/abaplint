import {IStatement} from "./_statement";
import {seq, alt, opt, altPrio, optPrio, pluss, per, vers} from "../combi";
import {Field, Source, Dynamic, FieldSub, ComponentChain, ReadTableTarget, BasicSource} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class ReadTable implements IStatement {

  public getMatcher(): IStatementRunnable {
    const comparing = seq("COMPARING", alt(pluss(FieldSub), Dynamic));

    const index = seq("INDEX", Source);

    const compare = seq(altPrio(ComponentChain, Dynamic),
                        "=",
                        Source);

    const components = seq(alt(Field, Dynamic), "COMPONENTS", pluss(compare));

    const key = seq(altPrio("WITH KEY", "WITH TABLE KEY"),
                    alt(pluss(compare),
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
                     seq("TRANSPORTING", altPrio(Dynamic, pluss(Field))),
                     "BINARY SEARCH");

    return seq("READ TABLE",
               alt(vers(Version.v740sp02, Source), BasicSource),
               opt(perm));
  }

}