import {IStatement} from "./_statement";
import {str, seq, opts, alts, pers} from "../combi";
import {Dynamic, DatabaseTable, SQLSource, DatabaseConnection} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ModifyDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {

    const from = seq("FROM", opts("TABLE"), SQLSource);

    const client = str("CLIENT SPECIFIED");

    const target = alts(DatabaseTable, Dynamic);

    const options = pers(DatabaseConnection, from, client);

    return seq("MODIFY", target, options);
  }

}