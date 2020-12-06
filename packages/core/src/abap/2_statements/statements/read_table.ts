import {IStatement} from "./_statement";
import {seqs, alts, opts, altPrios, optPrios, pluss, pers, vers} from "../combi";
import {Field, Source, Dynamic, FieldSub, ComponentChain, ReadTableTarget, BasicSource} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class ReadTable implements IStatement {

  public getMatcher(): IStatementRunnable {
    const comparing = seqs("COMPARING", alts(pluss(FieldSub), Dynamic));

    const index = seqs("INDEX", Source);

    const compare = seqs(altPrios(ComponentChain, Dynamic),
                         "=",
                         Source);

    const components = seqs(alts(Field, Dynamic), "COMPONENTS", pluss(compare));

    const key = seqs(altPrios("WITH KEY", "WITH TABLE KEY"),
                     alts(pluss(compare),
                          components,
                          seqs(optPrios("="), Source)));

    const using = seqs("USING KEY", alts(Field, Dynamic));

    const from = seqs("FROM", Source);

    const perm = pers(alts(index, key, from),
                      ReadTableTarget,
                      using,
                      comparing,
                      "CASTING",
                      "TRANSPORTING ALL FIELDS",
                      seqs("TRANSPORTING", altPrios(Dynamic, pluss(Field))),
                      "BINARY SEARCH");

    return seqs("READ TABLE",
                alts(vers(Version.v740sp02, Source), BasicSource),
                opts(perm));
  }

}