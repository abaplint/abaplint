import {IStatement} from "./_statement";
import {seq, alt, opt, altPrio, optPrio, plus, per, ver} from "../combi";
import {Field, Source, Dynamic, FieldSub, ComponentCompareSimple, ReadTableTarget, SimpleSource2} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class ReadTable implements IStatement {

  public getMatcher(): IStatementRunnable {
    const comparing = seq("COMPARING", alt(plus(FieldSub), Dynamic));

    const index = seq("INDEX", Source);

    const components = seq(alt(Field, Dynamic), "COMPONENTS", ComponentCompareSimple);

    const key = seq(altPrio("WITH KEY", "WITH TABLE KEY"),
                    alt(ComponentCompareSimple,
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
               alt(ver(Version.v740sp02, Source), SimpleSource2),
               opt(perm));
  }

}