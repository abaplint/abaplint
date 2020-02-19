import {Statement} from "./_statement";
import {str, seq, alt, opt, tok, IStatementRunnable} from "../combi";
import {DatabaseTable, Dynamic, SQLSource, Select, DatabaseConnection} from "../expressions";
import {WParenLeftW, WParenRightW} from "../tokens";

export class InsertDatabase extends Statement {

  public getMatcher(): IStatementRunnable {
    const target = alt(new DatabaseTable(), new Dynamic());

    const client = str("CLIENT SPECIFIED");

    const sub = seq(tok(WParenLeftW), new Select(), tok(WParenRightW));

    const f = seq(opt(client),
                  opt(new DatabaseConnection()),
                  str("FROM"),
                  opt(str("TABLE")),
                  alt(new SQLSource(), sub),
                  opt(str("ACCEPTING DUPLICATE KEYS")));

    const from = seq(target,
                     opt(alt(f, client, new DatabaseConnection())));

    const into = seq(str("INTO"),
                     target,
                     opt(str("CLIENT SPECIFIED")),
                     opt(new DatabaseConnection()),
                     str("VALUES"),
                     new SQLSource());

    return seq(str("INSERT"), alt(from, into));
  }

}