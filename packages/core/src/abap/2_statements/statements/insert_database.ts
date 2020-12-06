import {IStatement} from "./_statement";
import {str, seq, alt, opts, tok} from "../combi";
import {DatabaseTable, Dynamic, SQLSource, Select, DatabaseConnection} from "../expressions";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class InsertDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {
    const target = alt(DatabaseTable, Dynamic);

    const client = str("CLIENT SPECIFIED");

    const sub = seq(tok(WParenLeftW), Select, tok(WParenRightW));

    const f = seq(opts(client),
                  opts(DatabaseConnection),
                  "FROM",
                  opts("TABLE"),
                  alt(SQLSource, sub),
                  opts("ACCEPTING DUPLICATE KEYS"));

    const from = seq(target,
                     opts(alt(f, client, DatabaseConnection)));

    const into = seq("INTO",
                     target,
                     opts("CLIENT SPECIFIED"),
                     opts(DatabaseConnection),
                     "VALUES",
                     SQLSource);

    return seq("INSERT", alt(from, into));
  }

}