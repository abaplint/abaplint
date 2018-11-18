import {Statement} from "./_statement";
import {str, seq, opt, alt, IRunnable, star, tok} from "../combi";
import {Source, DatabaseTable, Dynamic, Field, SQLCond} from "../expressions";
import {WAt} from "../tokens/";

export class UpdateDatabase extends Statement {

  public getMatcher(): IRunnable {
    const target = alt(new DatabaseTable(), new Dynamic());

    const param = seq(new Field(), str("="), opt(tok(WAt)), new Source());
    const parameters = seq(param, star(seq(opt(str(",")), param)));

    const set = seq(str("SET"),
                    alt(parameters, new Dynamic()),
                    opt(seq(str("WHERE"), new SQLCond())));

    const fromTable = seq(str("FROM"),
                          opt(str("TABLE")),
                          new Source());

    const client = str("CLIENT SPECIFIED");
    const connection = seq(str("CONNECTION"), new Dynamic());

    const ret = seq(str("UPDATE"),
                    target,
                    opt(client),
                    opt(connection),
                    opt(alt(fromTable, set)));

    return ret;
  }

}