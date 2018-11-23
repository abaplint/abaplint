import {Statement} from "./_statement";
import {str, seq, alt, opt, IRunnable} from "../combi";
import {SQLSource, Dynamic, SQLCond, DatabaseTable} from "../expressions";

export class DeleteDatabase extends Statement {

  public getMatcher(): IRunnable {
    const where = seq(str("WHERE"), alt(new SQLCond(), new Dynamic()));
    const source = alt(new Dynamic(), new DatabaseTable());
// todo, client specified and connection not possible in Cloud
    const client = str("CLIENT SPECIFIED");
    const connection = seq(str("CONNECTION"), new Dynamic());

    const from = seq(str("FROM"), source, opt(client), opt(connection), opt(where));

    const table = seq(source,
                      opt(client),
                      opt(connection),
                      str("FROM"),
                      opt(str("TABLE")),
                      new SQLSource());

    const ret = seq(str("DELETE"), alt(from, table));

    return ret;
  }

}