import {IStatement} from "./_statement";
import {seq, optPrio, alt, opt} from "../combi";
import {Dynamic, SQLCond, DatabaseTable, SQLSourceSimple, DatabaseConnection} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {SQLClient} from "../expressions/sql_client";

export class DeleteDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {
    const where = seq("WHERE", alt(SQLCond, Dynamic));

    const from = seq("FROM", DatabaseTable, optPrio(SQLClient), optPrio(DatabaseConnection), opt(where));

    const table = seq(DatabaseTable,
                      optPrio(SQLClient),
                      opt(DatabaseConnection),
                      "FROM",
                      opt("TABLE"),
                      SQLSourceSimple);

    const ret = seq("DELETE", alt(from, table));

    return ret;
  }

}