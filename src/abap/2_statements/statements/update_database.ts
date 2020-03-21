import {IStatement} from "./_statement";
import {str, seq, opt, alt, IStatementRunnable, star} from "../combi";
import {SQLSource, DatabaseTable, Dynamic, Field, SQLCond, DatabaseConnection} from "../expressions";

export class UpdateDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {
    const target = alt(new DatabaseTable(), new Dynamic());

    const param = seq(new Field(), str("="), new SQLSource());
    const parameters = seq(param, star(seq(opt(str(",")), param)));

    const set = seq(str("SET"),
                    alt(parameters, new Dynamic()),
                    opt(seq(str("WHERE"), new SQLCond())));

    const fromTable = seq(str("FROM"),
                          opt(str("TABLE")),
                          new SQLSource());

    const client = str("CLIENT SPECIFIED");

    const ret = seq(str("UPDATE"),
                    target,
                    opt(client),
                    opt(new DatabaseConnection()),
                    opt(alt(fromTable, set)));

    return ret;
  }

}