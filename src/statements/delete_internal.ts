import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;
let per = Combi.per;
let plus = Combi.plus;

export class DeleteInternal extends Statement {

  public static get_matcher(): Combi.IRunnable {
// todo, is READ and DELETE similar? something can be reused?
    let index = seq(str("INDEX"), new Reuse.Source());

    let using = seq(str("USING KEY"), alt(new Reuse.SimpleName(), new Reuse.Dynamic()));

    let fromTo = seq(opt(seq(str("FROM"), new Reuse.Source())),
                     opt(seq(str("TO"), new Reuse.Source())));

    let where = seq(str("WHERE"), alt(new Reuse.Cond(), new Reuse.Dynamic()));

    let key = seq(str("WITH TABLE KEY"),
                  opt(seq(new Reuse.SimpleName(), str("COMPONENTS"))),
                  plus(new Reuse.Compare()));

    let table = seq(opt(str("TABLE")),
                    new Reuse.Target(),
                    alt(per(index, using), fromTo, key), opt(where));

    let adjacent = seq(str("ADJACENT DUPLICATES FROM"),
                       new Reuse.Target(),
                       opt(seq(str("COMPARING"), plus(alt(new Reuse.FieldSub(), new Reuse.Dynamic())))),
                       opt(seq(str("USING KEY"), new Reuse.Field())));

    let fs = seq(new Reuse.FieldSymbol(), where);

    return seq(str("DELETE"), alt(table, adjacent, fs));
  }

}