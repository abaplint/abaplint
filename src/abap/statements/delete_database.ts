import {Statement} from "./statement";
import {str, seq, alt, opt, IRunnable} from "../combi";
import {Source, Dynamic, SQLCond, DatabaseTable} from "../expressions";

export class DeleteDatabase extends Statement {

  public get_matcher(): IRunnable {
    let where = seq(str("WHERE"), alt(new SQLCond(), new Dynamic()));
    let source = alt(new Dynamic(), new DatabaseTable());
    let client = str("CLIENT SPECIFIED");
    let con = seq(str("CONNECTION"), new Dynamic());

    let from = seq(str("FROM"), source, opt(client), opt(con), opt(where));

    let table = seq(source,
                    opt(str("CLIENT SPECIFIED")),
                    str("FROM"),
                    opt(str("TABLE")),
                    new Source());

    let ret = seq(str("DELETE"), alt(from, table));

    return ret;
  }

}