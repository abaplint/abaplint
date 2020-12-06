import {seqs, opts, star, tok, Expression} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {SQLJoin, SQLFromSource} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLFrom extends Expression {
  public getRunnable(): IStatementRunnable {
    const from = seqs("FROM",
                      star(tok(WParenLeftW)),
                      SQLFromSource);

    const source = seqs(from, star(seqs(opts(tok(WParenRightW)), SQLJoin, opts(tok(WParenRightW)))));

    return source;
  }
}