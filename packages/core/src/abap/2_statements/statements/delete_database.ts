import {IStatement} from "./_statement";
import {seq, optPrios, alt, opts} from "../combi";
import {Dynamic, SQLCond, DatabaseTable, SQLSourceSimple, DatabaseConnection} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {SQLClient} from "../expressions/sql_client";

export class DeleteDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {
    const where = seq("WHERE", alt(SQLCond, Dynamic));
    const source = alt(Dynamic, DatabaseTable);

    const from = seq("FROM", source, optPrios(SQLClient), optPrios(DatabaseConnection), opts(where));

    const table = seq(source,
                      optPrios(SQLClient),
                      opts(DatabaseConnection),
                      "FROM",
                      opts("TABLE"),
                      SQLSourceSimple);

    const ret = seq("DELETE", alt(from, table));

    return ret;
  }

}