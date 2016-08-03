import { Statement } from "./statement";
import { Token } from "../tokens/";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;
let plus = Combi.plus;

export class DeleteInternal extends Statement {

  public static get_matcher(): Combi.IRunnable {
// todo, is READ and DELETE similar? something can be reused?
    let index = seq(str("INDEX"), Reuse.source());
    let fromTo = seq(opt(seq(str("FROM"), Reuse.source())), opt(seq(str("TO"), Reuse.source())));
    let where = seq(str("WHERE"), Reuse.cond());
    let key = seq(alt(str("WITH KEY"), str("WITH TABLE KEY")), plus(Reuse.compare()));
    let table = seq(opt(str("TABLE")), Reuse.target(), alt(index, fromTo, where, key));

    let adjacent = seq(str("ADJACENT DUPLICATES FROM"), Reuse.target(), str("COMPARING"), plus(Reuse.field()));

    return seq(str("DELETE"), alt(table, adjacent));
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher( ), tokens, true);
    if (result === true) {
      return new DeleteInternal(tokens);
    }
    return undefined;
  }

}