import {IStatement} from "./_statement";
import {str, seqs, alts, opts, tok} from "../combi";
import {DatabaseTable, Dynamic, SQLSource, Select, DatabaseConnection} from "../expressions";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class InsertDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {
    const target = alts(DatabaseTable, Dynamic);

    const client = str("CLIENT SPECIFIED");

    const sub = seqs(tok(WParenLeftW), Select, tok(WParenRightW));

    const f = seqs(opts(client),
                   opts(DatabaseConnection),
                   "FROM",
                   opts("TABLE"),
                   alts(SQLSource, sub),
                   opts("ACCEPTING DUPLICATE KEYS"));

    const from = seqs(target,
                      opts(alts(f, client, DatabaseConnection)));

    const into = seqs("INTO",
                      target,
                      opts("CLIENT SPECIFIED"),
                      opts(DatabaseConnection),
                      "VALUES",
                      SQLSource);

    return seqs("INSERT", alts(from, into));
  }

}