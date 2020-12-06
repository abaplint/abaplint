import {IStatement} from "./_statement";
import {seqs, opts, alts, star} from "../combi";
import {SQLSource, DatabaseTable, Dynamic, SQLFieldName, SQLCond, DatabaseConnection, SQLClient} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class UpdateDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {
    const target = alts(DatabaseTable, Dynamic);

    const param = seqs(SQLFieldName, "=", SQLSource);
    const parameters = seqs(param, star(seqs(opts(","), param)));

    const set = seqs("SET",
                     alts(parameters, Dynamic),
                     opts(seqs("WHERE", SQLCond)));

    const fromTable = seqs("FROM",
                           opts("TABLE"),
                           SQLSource);

    const ret = seqs("UPDATE",
                     target,
                     opts(SQLClient),
                     opts(DatabaseConnection),
                     opts(alts(fromTable, set)));

    return ret;
  }

}