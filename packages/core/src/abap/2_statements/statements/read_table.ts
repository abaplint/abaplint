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

    const key = seq(altPrio("WITH KEY", "WITH TABLE KEY"),
                    alt(ComponentCompareSimple,
                        components,
                        seq(optPrio("="), Source)));

    const using = seq("USING KEY", alt(Field, Dynamic));

    const from = seq("FROM", Source);

    const transporting = seq("TRANSPORTING", altPrio("ALL FIELDS", "NO FIELDS", TransportingFields));
    const common = [ReadTableTarget, comparing, "CASTING", transporting, "BINARY SEARCH"] as const;

    const perm = alt(per(alt(index, from), using, ...common),
                     per(key, ...common),
                     per(...common));

    return seq("READ TABLE",
               alt(SimpleSource2, ver(Version.v740sp02, Source, Version.OpenABAP)),
               opt(perm));
  }

}