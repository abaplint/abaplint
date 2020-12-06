import {IStatement} from "./_statement";
import {seq, optPrios, alts, opts} from "../combi";
import {Dynamic, SQLCond, DatabaseTable, SQLSourceSimple, DatabaseConnection} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {SQLClient} from "../expressions/sql_client";

export class DeleteDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {
    const where = seq("WHERE", alts(SQLCond, Dynamic));
    const source = alts(Dynamic, DatabaseTable);

    const from = seq("FROM", source, optPrios(SQLClient), optPrios(DatabaseConnection), opts(where));

    const table = seq(source,
                      optPrios(SQLClient),
                      opts(DatabaseConnection),
                      "FROM",
                      opts("TABLE"),
                      SQLSourceSimple);

    const ret = seq("DELETE", alts(from, table));

    return ret;
  }

}