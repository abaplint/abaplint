import {IStatement} from "./_statement";
import {seq, alt, opt, optPrio, per, plus, altPrio} from "../combi";
import {Target, Source, Dynamic, ComponentCompare, ComponentCond, SimpleName, Field, FieldSub, FieldOffset, FieldLength} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class DeleteInternal implements IStatement {

  public getMatcher(): IStatementRunnable {
// todo, is READ and DELETE similar? something can be reused?
    const index = seq("INDEX", Source);

    const using = seq("USING KEY", altPrio(SimpleName, Dynamic));

    const fromTo = seq(optPrio(seq("FROM", Source)),
                       optPrio(seq("TO", Source)));

    const where = seq("WHERE", alt(ComponentCond, Dynamic));

    const key = seq("WITH TABLE KEY",
                    opt(seq(SimpleName, "COMPONENTS")),
                    plus(ComponentCompare));

    const table = seq(opt("TABLE"),
                      Target,
                      alt(per(index, using), fromTo, key), opt(where));

    const f = seq(FieldSub, optPrio(FieldOffset), optPrio(FieldLength));

    const adjacent = seq("ADJACENT DUPLICATES FROM",
                         Target,
                         opt(seq("COMPARING", altPrio("ALL FIELDS", plus(altPrio(f, Dynamic))))),
                         optPrio(seq("USING KEY", Field)));

    return seq("DELETE", alt(table, adjacent));
  }

}