import {IStatement} from "./_statement";
import {str, seq, opt, alt, pers} from "../combi";
import {Dynamic, DatabaseTable, SQLSource, DatabaseConnection} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ModifyDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {

    const from = seq("FROM", opt("TABLE"), SQLSource);

    const client = str("CLIENT SPECIFIED");

    const target = alt(DatabaseTable, Dynamic);

    const options = pers(DatabaseConnection, from, client);

    return seq("MODIFY", target, options);
  }

}