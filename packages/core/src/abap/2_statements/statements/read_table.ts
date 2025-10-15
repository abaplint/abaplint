import {IStatement} from "./_statement";
import {seq, alt, opt, altPrio, optPrio, plus, per, ver} from "../combi";
import {Field, Source, Dynamic, FieldSub, ComponentCompareSimple, ReadTableTarget, SimpleSource2} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";
import {TransportingFields} from "../expressions/transporting_fields";

export class ReadTable implements IStatement {

  public getMatcher(): IStatementRunnable {
    const comparing = seq("COMPARING", alt(plus(FieldSub), plus(Dynamic)));

    const index = seq("INDEX", Source);

    const components = seq(alt(Field, Dynamic), "COMPONENTS", ComponentCompareSimple);

    const source = alt(SimpleSource2, ver(Version.v740sp02, Source, Version.OpenABAP));

    const key = seq(altPrio("WITH KEY", "WITH TABLE KEY"),
                    alt(ComponentCompareSimple,
                        components,
                        seq(optPrio("="), source)));

    const using = seq("USING KEY", alt(Field, Dynamic));

    const from = seq("FROM", source);

    const perm = per(alt(index, key, from),
                     ReadTableTarget,
                     using,
                     comparing,
                     "CASTING",
                     seq("TRANSPORTING", altPrio("ALL FIELDS", "NO FIELDS", TransportingFields)),
                     "BINARY SEARCH");

    return seq("READ TABLE",
               source,
               opt(perm));
  }

}