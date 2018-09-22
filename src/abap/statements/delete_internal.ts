import {Statement} from "./statement";
import {str, seq, alt, opt, per, plus, IRunnable} from "../combi";
import {FieldSymbol} from "../expressions";
import {Target, Source, Dynamic, Compare, Cond, SimpleName, Field, FieldSub} from "../expressions";

export class DeleteInternal extends Statement {

  public static get_matcher(): IRunnable {
// todo, is READ and DELETE similar? something can be reused?
    let index = seq(str("INDEX"), new Source());

    let using = seq(str("USING KEY"), alt(new SimpleName(), new Dynamic()));

    let fromTo = seq(opt(seq(str("FROM"), new Source())),
                     opt(seq(str("TO"), new Source())));

    let where = seq(str("WHERE"), alt(new Cond(), new Dynamic()));

    let key = seq(str("WITH TABLE KEY"),
                  opt(seq(new SimpleName(), str("COMPONENTS"))),
                  plus(new Compare()));

    let table = seq(opt(str("TABLE")),
                    new Target(),
                    alt(per(index, using), fromTo, key), opt(where));

    let adjacent = seq(str("ADJACENT DUPLICATES FROM"),
                       new Target(),
                       opt(seq(str("COMPARING"), plus(alt(new FieldSub(), new Dynamic())))),
                       opt(seq(str("USING KEY"), new Field())));

    let fs = seq(new FieldSymbol(), where);

    return seq(str("DELETE"), alt(table, adjacent, fs));
  }

}