import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, alt, opt, IRunnable} from "../combi";

export class InsertDatabase extends Statement {

  public static get_matcher(): IRunnable {
    let target = alt(new Reuse.DatabaseTable(), new Reuse.Dynamic());

    let client = str("CLIENT SPECIFIED");

    let conn = seq(str("CONNECTION"), alt(new Reuse.Source(), new Reuse.Dynamic()));

    let f = seq(opt(client),
                opt(conn),
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