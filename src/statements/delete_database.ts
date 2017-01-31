import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class DeleteDatabase extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let where = seq(str("WHERE"), alt(new Reuse.SQLCond(), new Reuse.Dynamic()));
    let source = alt(new Reuse.Dynamic(), new Reuse.DatabaseTable());
    let client = str("CLIENT SPECIFIED");
    let con = seq(str("CONNECTION"), new Reuse.Dynamic());

    let from = seq(str("FROM"), source, opt(client), opt(con), opt(where));

    let table = seq(source,
                    opt(str("CLIENT SPECIFIED")),
                    str("FROM"),
                    opt(str("TABLE")),
                    new Reuse.Source());

    let ret = seq(str("DELETE"), alt(from, table));

    return ret;
  }

}