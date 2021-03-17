import {IStatement} from "./_statement";
import {seq, opt, alt, star} from "../combi";
import {SQLSource, DatabaseTable, Dynamic, SQLFieldName, SQLCond, DatabaseConnection, SQLClient} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class UpdateDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {
    const param = seq(SQLFieldName, "=", SQLSource);
    const parameters = seq(param, star(seq(opt(","), param)));

    const set = seq("SET",
                    alt(parameters, Dynamic),
                    opt(seq("WHERE", SQLCond)));

    const fromTable = seq("FROM",
                          opt("TABLE"),
                          SQLSource);

    const ret = seq("UPDATE",
                    DatabaseTable,
                    opt(SQLClient),
                    opt(DatabaseConnection),
                    opt(alt(fromTable, set)));

    return ret;
  }

}