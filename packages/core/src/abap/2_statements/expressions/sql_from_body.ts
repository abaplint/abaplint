import {seq, starPrio, optPrio, tok, Expression, altPrio, verNotLang} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {SQLJoin, SQLFromSource} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {LanguageVersion} from "../../../version";

export class SQLFromBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const joins = starPrio(seq(optPrio(tok(WParenRightW)), SQLJoin));

    const leaf = seq(SQLFromSource, joins);

    const nested = verNotLang(LanguageVersion.KeyUser,
                              seq(tok(WParenLeftW),
                                  SQLFromBody,
                                  optPrio(tok(WParenRightW)),
                                  joins));

    return altPrio(nested, leaf);
  }
}
