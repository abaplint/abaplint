import {IStatement} from "./_statement";
import {seqs, optPrios, alts, opts} from "../combi";
import {Dynamic, SQLCond, DatabaseTable, SQLSourceSimple, DatabaseConnection} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {SQLClient} from "../expressions/sql_client";

export class DeleteDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {
    const where = seqs("WHERE", alts(SQLCond, Dynamic));
    const source = alts(Dynamic, DatabaseTable);

    const from = seqs("FROM", source, optPrios(SQLClient), optPrios(DatabaseConnection), opts(where));

    const table = seqs(source,
                       optPrios(SQLClient),
                       opts(DatabaseConnection),
                       "FROM",
                       opts("TABLE"),
                       SQLSourceSimple);

    const ret = seqs("DELETE", alts(from, table));

    return ret;
  }

}