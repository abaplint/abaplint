import {IStatement} from "./_statement";
import {str, seq, opt, alt, per} from "../combi";
import {Dynamic, DatabaseTable, SQLSource, DatabaseConnection} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ModifyDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {

    const from = seq(str("FROM"), opt(str("TABLE")), new SQLSource());

    const client = str("CLIENT SPECIFIED");

    const target = alt(new DatabaseTable(), new Dynamic());

    const options = per(new DatabaseConnection(), from, client);

    return seq(str("MODIFY"), target, options);
  }

}