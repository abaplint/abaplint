import {str, alt, seq, opt, star, tok, Expression, IStatementRunnable} from "../combi";
import {WParenLeftW, WParenRightW} from "../tokens/";
import {SQLJoin, Field, Dynamic, SQLCDSParameters, DatabaseTable} from "./";

export class SQLFrom extends Expression {
  public getRunnable(): IStatementRunnable {

    const aas = seq(str("AS"), new Field());

    const from = seq(str("FROM"),
                     star(tok(WParenLeftW)),
                     alt(new Dynamic(), seq(new DatabaseTable(), opt(new SQLCDSParameters()))),
                     opt(aas));

    const source = seq(from, star(seq(opt(tok(WParenRightW)), new SQLJoin(), opt(tok(WParenRightW)))));

    return source;
  }
}