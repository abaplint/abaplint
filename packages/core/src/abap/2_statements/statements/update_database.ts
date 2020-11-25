import {IStatement} from "./_statement";
import {str, seq, opt, alt, star} from "../combi";
import {SQLSource, DatabaseTable, Dynamic, SQLFieldName, SQLCond, DatabaseConnection, SQLClient} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class UpdateDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {
    const target = alt(new DatabaseTable(), new Dynamic());

    const param = seq(new SQLFieldName(), str("="), new SQLSource());
    const parameters = seq(param, star(seq(opt(str(",")), param)));

    const set = seq(str("SET"),
                    alt(parameters, new Dynamic()),
                    opt(seq(str("WHERE"), new SQLCond())));

    const fromTable = seq(str("FROM"),
                          opt(str("TABLE")),
                          new SQLSource());

    const ret = seq(str("UPDATE"),
                    target,
                    opt(new SQLClient()),
                    opt(new DatabaseConnection()),
                    opt(alt(fromTable, set)));

    return ret;
  }

}