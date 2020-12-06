import {IStatement} from "./_statement";
import {str, seqs, opt, alts, star} from "../combi";
import {SQLSource, DatabaseTable, Dynamic, SQLFieldName, SQLCond, DatabaseConnection, SQLClient} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class UpdateDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {
    const target = alts(DatabaseTable, Dynamic);

    const param = seqs(SQLFieldName, "=", SQLSource);
    const parameters = seqs(param, star(seqs(opt(str(",")), param)));

    const set = seqs("SET",
                     alts(parameters, Dynamic),
                     opt(seqs("WHERE", SQLCond)));

    const fromTable = seqs("FROM",
                           opt(str("TABLE")),
                           SQLSource);

    const ret = seqs("UPDATE",
                     target,
                     opt(new SQLClient()),
                     opt(new DatabaseConnection()),
                     opt(alts(fromTable, set)));

    return ret;
  }

}