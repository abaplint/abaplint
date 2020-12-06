import {IStatement} from "./_statement";
import {str, seqs, alts, opt, per, plus, altPrios} from "../combi";
import {Target, Source, Dynamic, ComponentCompare, ComponentCond, SimpleName, Field, FieldSub} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class DeleteInternal implements IStatement {

  public getMatcher(): IStatementRunnable {
// todo, is READ and DELETE similar? something can be reused?
    const index = seqs("INDEX", Source);

    const using = seqs("USING KEY", alts(SimpleName, Dynamic));

    const fromTo = seqs(opt(seqs("FROM", Source)),
                        opt(seqs("TO", Source)));

    const where = seqs("WHERE", alts(ComponentCond, Dynamic));

    const key = seqs("WITH TABLE KEY",
                     opt(seqs(SimpleName, "COMPONENTS")),
                     plus(new ComponentCompare()));

    const table = seqs(opt(str("TABLE")),
                       Target,
                       alts(per(index, using), fromTo, key), opt(where));

    const adjacent = seqs("ADJACENT DUPLICATES FROM",
                          Target,
                          opt(seqs("COMPARING", altPrios("ALL FIELDS", plus(alts(FieldSub, Dynamic))))),
                          opt(seqs("USING KEY", Field)));

//    const fs = seq(new FieldSymbol(), where);

    return seqs("DELETE", alts(table, adjacent));
  }

}