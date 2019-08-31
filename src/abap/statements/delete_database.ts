import {Statement} from "./_statement";
import {str, seq, alt, opt, IStatementRunnable} from "../combi";
import {Dynamic, SQLCond, DatabaseTable, SQLSourceSimple} from "../expressions";

export class DeleteDatabase extends Statement {

  public getMatcher(): IStatementRunnable {
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
                      new SQLSourceSimple());

    const ret = seq(str("DELETE"), alt(from, table));

    return ret;
  }

}