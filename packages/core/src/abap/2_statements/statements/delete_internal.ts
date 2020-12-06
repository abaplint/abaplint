import {IStatement} from "./_statement";
import {seqs, alts, opts, pers, pluss, altPrios} from "../combi";
import {Target, Source, Dynamic, ComponentCompare, ComponentCond, SimpleName, Field, FieldSub} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class DeleteInternal implements IStatement {

  public getMatcher(): IStatementRunnable {
// todo, is READ and DELETE similar? something can be reused?
    const index = seqs("INDEX", Source);

    const using = seqs("USING KEY", alts(SimpleName, Dynamic));

    const fromTo = seqs(opts(seqs("FROM", Source)),
                        opts(seqs("TO", Source)));

    const where = seqs("WHERE", alts(ComponentCond, Dynamic));

    const key = seqs("WITH TABLE KEY",
                     opts(seqs(SimpleName, "COMPONENTS")),
                     pluss(ComponentCompare));

    const table = seqs(opts("TABLE"),
                       Target,
                       alts(pers(index, using), fromTo, key), opts(where));

    const adjacent = seqs("ADJACENT DUPLICATES FROM",
                          Target,
                          opts(seqs("COMPARING", altPrios("ALL FIELDS", pluss(alts(FieldSub, Dynamic))))),
                          opts(seqs("USING KEY", Field)));

    return seqs("DELETE", alts(table, adjacent));
  }

}