import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class InsertDatabase extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let target = alt(new Reuse.DatabaseTable(), new Reuse.Dynamic());

    let client = str("CLIENT SPECIFIED");

    let f = seq(opt(client),
                str("FROM"),
                opt(str("TABLE")),
                new Reuse.Source(),
                opt(str("ACCEPTING DUPLICATE KEYS")));

    let from = seq(target,
                   opt(alt(f, client)));

    let into = seq(str("INTO"),
                   target,
                   opt(str("CLIENT SPECIFIED")),
                   str("VALUES"),
                   new Reuse.Source());

    return seq(str("INSERT"), alt(from, into));
  }

}