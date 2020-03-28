import {IStatement} from "./_statement";
import {str, seq, alt, opt} from "../combi";
import {Dynamic, SQLCond, DatabaseTable, SQLSourceSimple, DatabaseConnection} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class DeleteDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {
    const where = seq(str("WHERE"), alt(new SQLCond(), new Dynamic()));
    const source = alt(new Dynamic(), new DatabaseTable());
// todo, client specified and connection not possible in Cloud
    const client = alt(str("CLIENT SPECIFIED"), seq(str("USING CLIENT"), new SQLSourceSimple()));

    const from = seq(str("FROM"), source, opt(client), opt(new DatabaseConnection()), opt(where));

    const table = seq(source,
                      opt(client),
                      opt(new DatabaseConnection()),
                      str("FROM"),
                      opt(str("TABLE")),
                      new SQLSourceSimple());

    const ret = seq(str("DELETE"), alt(from, table));

    return ret;
  }

}