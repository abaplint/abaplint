import {IStatement} from "./_statement";
import {str, seqs, alt, opt, per, plus, altPrio} from "../combi";
import {Target, Source, Dynamic, ComponentCompare, ComponentCond, SimpleName, Field, FieldSub} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class DeleteInternal implements IStatement {

  public getMatcher(): IStatementRunnable {
// todo, is READ and DELETE similar? something can be reused?
    const index = seqs("INDEX", Source);

    const using = seqs("USING KEY", alt(new SimpleName(), new Dynamic()));

    const fromTo = seqs(opt(seqs("FROM", Source)),
                        opt(seqs("TO", Source)));

    const where = seqs("WHERE", alt(new ComponentCond(), new Dynamic()));

    const key = seqs("WITH TABLE KEY",
                     opt(seqs(SimpleName, "COMPONENTS")),
                     plus(new ComponentCompare()));

    const table = seqs(opt(str("TABLE")),
                       Target,
                       alt(per(index, using), fromTo, key), opt(where));

    const adjacent = seqs("ADJACENT DUPLICATES FROM",
                          Target,
                          opt(seqs("COMPARING", altPrio(str("ALL FIELDS"), plus(alt(new FieldSub(), new Dynamic()))))),
                          opt(seqs("USING KEY", Field)));

//    const fs = seq(new FieldSymbol(), where);

    return seqs("DELETE", alt(table, adjacent));
  }

}