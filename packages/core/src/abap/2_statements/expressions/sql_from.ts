import {seqs, opts, stars, tok, Expression} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {SQLJoin, SQLFromSource} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLFrom extends Expression {
  public getRunnable(): IStatementRunnable {
    const from = seqs("FROM",
                      stars(tok(WParenLeftW)),
                      SQLFromSource);

    const source = seqs(from, stars(seqs(opts(tok(WParenRightW)), SQLJoin, opts(tok(WParenRightW)))));

    return source;
  }
}