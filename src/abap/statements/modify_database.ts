import {Statement} from "./_statement";
import {str, seq, opt, alt, per, IStatementRunnable} from "../combi";
import {Source, Dynamic, DatabaseTable, SQLSource} from "../expressions";

export class ModifyDatabase extends Statement {

  public getMatcher(): IStatementRunnable {

    const from = seq(str("FROM"), opt(str("TABLE")), new SQLSource());

    const client = str("CLIENT SPECIFIED");

    const target = alt(new DatabaseTable(), new Dynamic());

    const conn = seq(str("CONNECTION"), alt(new Dynamic(), new Source()));

    const options = per(conn, from, client);

    return seq(str("MODIFY"), target, options);
  }

}