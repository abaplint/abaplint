import {IStatement} from "./_statement";
import {str, seqs, opt, alt, per} from "../combi";
import {Dynamic, DatabaseTable, SQLSource, DatabaseConnection} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ModifyDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {

    const from = seqs("FROM", opt(str("TABLE")), SQLSource);

    const client = str("CLIENT SPECIFIED");

    const target = alt(new DatabaseTable(), new Dynamic());

    const options = per(new DatabaseConnection(), from, client);

    return seqs("MODIFY", target, options);
  }

}