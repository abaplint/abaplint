import {Statement} from "./_statement";
import {str, seq, alt, opt, IRunnable} from "../combi";
import {Source, DatabaseTable, Dynamic, SQLSource} from "../expressions";

export class InsertDatabase extends Statement {

  public getMatcher(): IRunnable {
    const target = alt(new DatabaseTable(), new Dynamic());

    const client = str("CLIENT SPECIFIED");

    const conn = seq(str("CONNECTION"), alt(new Source(), new Dynamic()));

    const f = seq(opt(client),
                  opt(conn),
                  str("FROM"),
                  opt(str("TABLE")),
                  new SQLSource(),
                  opt(str("ACCEPTING DUPLICATE KEYS")));

    const from = seq(target,
                     opt(alt(f, client)));

    const into = seq(str("INTO"),
                     target,
                     opt(str("CLIENT SPECIFIED")),
                     opt(conn),
                     str("VALUES"),
                     new Source());

    return seq(str("INSERT"), alt(from, into));
  }

}