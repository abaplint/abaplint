import {IStatement} from "./_statement";
import {str, seq, optPrio, alt, opt} from "../combi";
import {Dynamic, SQLCond, DatabaseTable, SQLSourceSimple, DatabaseConnection} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {SQLClient} from "../expressions/sql_client";

export class DeleteDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {
    const where = seq(str("WHERE"), alt(new SQLCond(), new Dynamic()));
    const source = alt(new Dynamic(), new DatabaseTable());

    const from = seq(str("FROM"), source, optPrio(new SQLClient()), optPrio(new DatabaseConnection()), opt(where));

    const table = seq(source,
                      optPrio(new SQLClient()),
                      opt(new DatabaseConnection()),
                      str("FROM"),
                      opt(str("TABLE")),
                      new SQLSourceSimple());

    const ret = seq(str("DELETE"), alt(from, table));

    return ret;
  }

}