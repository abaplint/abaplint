import {IStatement} from "./_statement";
import {seq, opt, alt, star} from "../combi";
import {SQLSource, DatabaseTable, Dynamic, SQLFieldAndValue, SQLCond, DatabaseConnection, SQLClient} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class UpdateDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {
    const parameters = seq(SQLFieldAndValue, star(seq(opt(","), SQLFieldAndValue)));

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