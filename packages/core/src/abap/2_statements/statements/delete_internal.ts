import {IStatement} from "./_statement";
import {str, seq, alt, opt, per, plus, altPrio} from "../combi";
import {Target, Source, Dynamic, ComponentCompare, ComponentCond, SimpleName, Field, FieldSub} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class DeleteInternal implements IStatement {

  public getMatcher(): IStatementRunnable {
// todo, is READ and DELETE similar? something can be reused?
    const index = seq(str("INDEX"), new Source());

    const using = seq(str("USING KEY"), alt(new SimpleName(), new Dynamic()));

    const fromTo = seq(opt(seq(str("FROM"), new Source())),
                       opt(seq(str("TO"), new Source())));

    const where = seq(str("WHERE"), alt(new ComponentCond(), new Dynamic()));

    const key = seq(str("WITH TABLE KEY"),
                    opt(seq(new SimpleName(), str("COMPONENTS"))),
                    plus(new ComponentCompare()));

    const table = seq(opt(str("TABLE")),
                      new Target(),
                      alt(per(index, using), fromTo, key), opt(where));

    const adjacent = seq(str("ADJACENT DUPLICATES FROM"),
                         new Target(),
                         opt(seq(str("COMPARING"), altPrio(str("ALL FIELDS"), plus(alt(new FieldSub(), new Dynamic()))))),
                         opt(seq(str("USING KEY"), new Field())));

//    const fs = seq(new FieldSymbol(), where);

    return seq(str("DELETE"), alt(table, adjacent));
  }

}