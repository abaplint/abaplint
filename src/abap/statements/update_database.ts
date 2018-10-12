import {Statement} from "./statement";
import {str, seq, opt, alt, IRunnable, star, tok} from "../combi";
import {Source, DatabaseTable, Dynamic, Field, SQLCond} from "../expressions";
import {WAt} from "../tokens/";

export class UpdateDatabase extends Statement {

  public getMatcher(): IRunnable {
    let target = alt(new DatabaseTable(), new Dynamic());

    let param = seq(new Field(), str("="), opt(tok(WAt)), new Source());
    let parameters = seq(param, star(seq(opt(str(",")), param)));

    let set = seq(str("SET"),
                  alt(parameters, new Dynamic()),
                  opt(seq(str("WHERE"), new SQLCond())));

    let fromTable = seq(str("FROM"),
                        opt(str("TABLE")),
                        new Source());

    let client = str("CLIENT SPECIFIED");

    let ret = seq(str("UPDATE"),
                  target,
                  opt(client),
                  opt(alt(fromTable, set)));

    return ret;
  }

}