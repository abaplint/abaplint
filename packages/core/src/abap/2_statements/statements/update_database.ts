import {IStatement} from "./_statement";
import {str, seqs, opt, alt, star} from "../combi";
import {SQLSource, DatabaseTable, Dynamic, SQLFieldName, SQLCond, DatabaseConnection, SQLClient} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class UpdateDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {
    const target = alt(new DatabaseTable(), new Dynamic());

    const param = seqs(SQLFieldName, "=", SQLSource);
    const parameters = seqs(param, star(seqs(opt(str(",")), param)));

    const set = seqs("SET",
                     alt(parameters, new Dynamic()),
                     opt(seqs("WHERE", SQLCond)));

    const fromTable = seqs("FROM",
                           opt(str("TABLE")),
                           SQLSource);

    const ret = seqs("UPDATE",
                     target,
                     opt(new SQLClient()),
                     opt(new DatabaseConnection()),
                     opt(alt(fromTable, set)));

    return ret;
  }

}