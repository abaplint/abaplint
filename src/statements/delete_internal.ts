import { Statement } from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;
let plus = Combi.plus;

export class DeleteInternal extends Statement {

  public static get_matcher(): Combi.IRunnable {
// todo, is READ and DELETE similar? something can be reused?
    let index = seq(str("INDEX"), new Reuse.Source());

    let fromTo = seq(opt(seq(str("FROM"), new Reuse.Source())),
                     opt(seq(str("TO"), new Reuse.Source())));

    let where = seq(str("WHERE"), new Reuse.Cond());
    let key = seq(alt(str("WITH KEY"), str("WITH TABLE KEY")), plus(new Reuse.Compare()));
    let table = seq(opt(str("TABLE")), new Reuse.Target(), alt(index, fromTo, key), opt(where));

    let adjacent = seq(str("ADJACENT DUPLICATES FROM"),
                       new Reuse.Target(),
                       opt(seq(str("COMPARING"), plus(new Reuse.Field()))),
                       opt(seq(str("USING KEY"), new Reuse.Field())));

    return seq(str("DELETE"), alt(table, adjacent));
  }

}