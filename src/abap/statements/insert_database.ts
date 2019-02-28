import {Statement} from "./_statement";
import {str, seq, alt, opt, tok, IStatementRunnable} from "../combi";
import {Source, DatabaseTable, Dynamic, SQLSource, Select} from "../expressions";
import {WParenLeftW, WParenRightW} from "../tokens";

export class InsertDatabase extends Statement {

  public getMatcher(): IStatementRunnable {
    const target = alt(new DatabaseTable(), new Dynamic());

    const client = str("CLIENT SPECIFIED");

    const conn = seq(str("CONNECTION"), alt(new Source(), new Dynamic()));

    const sub = seq(tok(WParenLeftW), new Select(), tok(WParenRightW));

    const f = seq(opt(client),
                  opt(conn),
                  str("FROM"),
                  opt(str("TABLE")),
                  alt(new SQLSource(), sub),
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