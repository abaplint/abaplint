import {Statement} from "./statement";
import {str, seq, alt, opt, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class DeleteDatabase extends Statement {

  public static get_matcher(): IRunnable {
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