import {IStatement} from "./_statement";
import {seq, alt, opts, pers, pluss, altPrios} from "../combi";
import {Target, Source, Dynamic, ComponentCompare, ComponentCond, SimpleName, Field, FieldSub} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class DeleteInternal implements IStatement {

  public getMatcher(): IStatementRunnable {
// todo, is READ and DELETE similar? something can be reused?
    const index = seq("INDEX", Source);

    const using = seq("USING KEY", alt(SimpleName, Dynamic));

    const fromTo = seq(opts(seq("FROM", Source)),
                       opts(seq("TO", Source)));

    const where = seq("WHERE", alt(ComponentCond, Dynamic));

    const key = seq("WITH TABLE KEY",
                    opts(seq(SimpleName, "COMPONENTS")),
                    pluss(ComponentCompare));

    const table = seq(opts("TABLE"),
                      Target,
                      alt(pers(index, using), fromTo, key), opts(where));

    const adjacent = seq("ADJACENT DUPLICATES FROM",
                         Target,
                         opts(seq("COMPARING", altPrios("ALL FIELDS", pluss(alt(FieldSub, Dynamic))))),
                         opts(seq("USING KEY", Field)));

    return seq("DELETE", alt(table, adjacent));
  }

}