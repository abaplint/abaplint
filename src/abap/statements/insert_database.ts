import {Statement} from "./statement";
import {str, seq, alt, opt, IRunnable} from "../combi";
import {Source, DatabaseTable, Dynamic} from "../expressions";

export class InsertDatabase extends Statement {

  public getMatcher(): IRunnable {
    let target = alt(new DatabaseTable(), new Dynamic());

    let client = str("CLIENT SPECIFIED");

    let conn = seq(str("CONNECTION"), alt(new Source(), new Dynamic()));

    let f = seq(opt(client),
                opt(conn),
                str("FROM"),
                opt(str("TABLE")),
                new Source(),
                opt(str("ACCEPTING DUPLICATE KEYS")));

    let from = seq(target,
                   opt(alt(f, client)));

    let into = seq(str("INTO"),
                   target,
                   opt(str("CLIENT SPECIFIED")),
                   opt(conn),
                   str("VALUES"),
                   new Source());

    return seq(str("INSERT"), alt(from, into));
  }

}