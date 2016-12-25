import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;

export class UpdateDatabase extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let target = alt(new Reuse.DatabaseTable(), new Reuse.Dynamic());

    let set = seq(str("SET"),
                  new Reuse.ParameterListS(),
                  opt(seq(str("WHERE"), new Reuse.Cond())));

    let fromTable = seq(str("FROM"),
                        opt(str("TABLE")),
                        new Reuse.Source());

    let from = seq(opt(str("CLIENT SPECIFIED")),
                   opt(fromTable));

    let ret = seq(str("UPDATE"),
                  target,
                  alt(from, set));

    return ret;
  }

}