import {IStatement} from "./_statement";
import {seq, opts, alts, stars} from "../combi";
import {SQLSource, DatabaseTable, Dynamic, SQLFieldName, SQLCond, DatabaseConnection, SQLClient} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class UpdateDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {
    const target = alts(DatabaseTable, Dynamic);

    const param = seq(SQLFieldName, "=", SQLSource);
    const parameters = seq(param, stars(seq(opts(","), param)));

    const set = seq("SET",
                    alts(parameters, Dynamic),
                    opts(seq("WHERE", SQLCond)));

    const fromTable = seq("FROM",
                          opts("TABLE"),
                          SQLSource);

    const ret = seq("UPDATE",
                    target,
                    opts(SQLClient),
                    opts(DatabaseConnection),
                    opts(alts(fromTable, set)));

    return ret;
  }

}