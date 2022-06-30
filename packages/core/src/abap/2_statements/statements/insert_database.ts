import {IStatement} from "./_statement";
import {seq, alt, opt, tok} from "../combi";
import {DatabaseTable, SQLSource, Select, DatabaseConnection, SQLClient} from "../expressions";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class InsertDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {
    const sub = seq(tok(WParenLeftW), Select, tok(WParenRightW));

    const f = seq(opt(SQLClient),
                  opt(DatabaseConnection),
                  "FROM",
                  opt("TABLE"),
                  alt(SQLSource, sub),
                  opt("ACCEPTING DUPLICATE KEYS"));

    const from = seq(DatabaseTable,
                     opt(alt(f, SQLClient, DatabaseConnection)));

    const into = seq("INTO",
                     DatabaseTable,
                     opt(SQLClient),
                     opt(DatabaseConnection),
                     "VALUES",
                     SQLSource);

    return seq("INSERT", alt(from, into));
  }

}