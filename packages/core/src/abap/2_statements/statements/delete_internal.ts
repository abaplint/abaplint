import {IStatement} from "./_statement";
import {seq, alt, opt, per, plus, altPrio} from "../combi";
import {Target, Source, Dynamic, ComponentCompare, ComponentCond, SimpleName, Field, FieldSub} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class DeleteInternal implements IStatement {

  public getMatcher(): IStatementRunnable {
// todo, is READ and DELETE similar? something can be reused?
    const index = seq("INDEX", Source);

    const using = seq("USING KEY", alt(SimpleName, Dynamic));

    const fromTo = seq(opt(seq("FROM", Source)),
                       opt(seq("TO", Source)));

    const where = seq("WHERE", alt(ComponentCond, Dynamic));

    const key = seq("WITH TABLE KEY",
                    opt(seq(SimpleName, "COMPONENTS")),
                    plus(ComponentCompare));

    const table = seq(opt("TABLE"),
                      Target,
                      alt(per(index, using), fromTo, key), opt(where));

    const adjacent = seq("ADJACENT DUPLICATES FROM",
                         Target,
                         opt(seq("COMPARING", altPrio("ALL FIELDS", plus(alt(FieldSub, Dynamic))))),
                         opt(seq("USING KEY", Field)));

    return seq("DELETE", alt(table, adjacent));
  }

}