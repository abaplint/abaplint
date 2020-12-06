import {alts, seqs, optPrios, star, tok, Expression} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {SQLCompare} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLCond extends Expression {
  public getRunnable(): IStatementRunnable {
    const operator = alts("AND", "OR");

    const paren = seqs(tok(WParenLeftW),
                       SQLCond,
                       tok(WParenRightW));

    const cnd = seqs(optPrios("NOT"), alts(SQLCompare, paren));

    const ret = seqs(cnd, star(seqs(operator, cnd)));

    return ret;
  }
}