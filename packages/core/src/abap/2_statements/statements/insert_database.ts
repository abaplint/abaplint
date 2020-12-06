import {IStatement} from "./_statement";
import {str, seqs, alts, opt, tok} from "../combi";
import {DatabaseTable, Dynamic, SQLSource, Select, DatabaseConnection} from "../expressions";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class InsertDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {
    const target = alts(DatabaseTable, Dynamic);

    const client = str("CLIENT SPECIFIED");

    const sub = seqs(tok(WParenLeftW), Select, tok(WParenRightW));

    const f = seqs(opt(client),
                   opt(new DatabaseConnection()),
                   "FROM",
                   opt(str("TABLE")),
                   alts(SQLSource, sub),
                   opt(str("ACCEPTING DUPLICATE KEYS")));

    const from = seqs(target,
                      opt(alts(f, client, DatabaseConnection)));

    const into = seqs("INTO",
                      target,
                      opt(str("CLIENT SPECIFIED")),
                      opt(new DatabaseConnection()),
                      "VALUES",
                      SQLSource);

    return seqs("INSERT", alts(from, into));
  }

}