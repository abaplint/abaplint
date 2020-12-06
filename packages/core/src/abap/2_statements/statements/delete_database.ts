import {IStatement} from "./_statement";
import {str, seqs, optPrio, alts, opt} from "../combi";
import {Dynamic, SQLCond, DatabaseTable, SQLSourceSimple, DatabaseConnection} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {SQLClient} from "../expressions/sql_client";

export class DeleteDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {
    const where = seqs("WHERE", alts(SQLCond, Dynamic));
    const source = alts(Dynamic, DatabaseTable);

    const from = seqs("FROM", source, optPrio(new SQLClient()), optPrio(new DatabaseConnection()), opt(where));

    const table = seqs(source,
                       optPrio(new SQLClient()),
                       opt(new DatabaseConnection()),
                       "FROM",
                       opt(str("TABLE")),
                       SQLSourceSimple);

    const ret = seqs("DELETE", alts(from, table));

    return ret;
  }

}