import {Statement} from "./_statement";
import {str, seq, alt, opt, per, plus, IRunnable} from "../combi";
import {FieldSymbol} from "../expressions";
import {Target, Source, Dynamic, Compare, Cond, SimpleName, Field, FieldSub} from "../expressions";

export class DeleteInternal extends Statement {

  public getMatcher(): IRunnable {
// todo, is READ and DELETE similar? something can be reused?
    const index = seq(str("INDEX"), new Source());

    const using = seq(str("USING KEY"), alt(new SimpleName(), new Dynamic()));

    const fromTo = seq(opt(seq(str("FROM"), new Source())),
                       opt(seq(str("TO"), new Source())));

    const where = seq(str("WHERE"), alt(new Cond(), new Dynamic()));

    const key = seq(str("WITH TABLE KEY"),
                    opt(seq(new SimpleName(), str("COMPONENTS"))),
                    plus(new Compare()));

    const table = seq(opt(str("TABLE")),
                      new Target(),
                      alt(per(index, using), fromTo, key), opt(where));

    const adjacent = seq(str("ADJACENT DUPLICATES FROM"),
                         new Target(),
                         opt(seq(str("COMPARING"), plus(alt(new FieldSub(), new Dynamic())))),
                         opt(seq(str("USING KEY"), new Field())));

    const fs = seq(new FieldSymbol(), where);

    return seq(str("DELETE"), alt(table, adjacent, fs));
  }

}