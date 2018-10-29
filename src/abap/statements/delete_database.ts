import {Statement} from "./statement";
import {str, seq, alt, opt, IRunnable} from "../combi";
import {Source, Dynamic, SQLCond, DatabaseTable} from "../expressions";

export class DeleteDatabase extends Statement {

  public getMatcher(): IRunnable {
    let where = seq(str("WHERE"), alt(new SQLCond(), new Dynamic()));
    let source = alt(new Dynamic(), new DatabaseTable());
    let client = str("CLIENT SPECIFIED");
    let connection = seq(str("CONNECTION"), new Dynamic());

    let from = seq(str("FROM"), source, opt(client), opt(connection), opt(where));

    let table = seq(source,
                    opt(client),
                    opt(connection),
                    str("FROM"),
                    opt(str("TABLE")),
                    new Source());

    let ret = seq(str("DELETE"), alt(from, table));

    return ret;
  }

}