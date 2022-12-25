import {IStatement} from "./_statement";
import {seq, optPrio, opt, altPrio} from "../combi";
import {Dynamic, SQLCond, DatabaseTable, SQLSourceSimple, DatabaseConnection} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {SQLClient} from "../expressions/sql_client";

export class DeleteDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {
    const where = seq("WHERE", altPrio(SQLCond, Dynamic));

    const from = seq("FROM", DatabaseTable, optPrio(SQLClient), optPrio(DatabaseConnection), opt(where));

    const table = seq(DatabaseTable,
                      optPrio(SQLClient),
                      optPrio(DatabaseConnection),
                      "FROM",
                      opt("TABLE"),
                      SQLSourceSimple);

    const ret = seq("DELETE", altPrio(from, table));

    return ret;
  }

}