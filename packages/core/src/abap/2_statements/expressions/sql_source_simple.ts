import {alt, seq, ver, tok, Expression} from "../combi";
import {Version} from "../../../version";
import {WAt, ParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {Source, SimpleSource3} from ".";
import {IStatementRunnable} from "../statement_runnable";

// todo, delete this expression, its the same as SQLSource?
export class SQLSourceSimple extends Expression {
  public getRunnable(): IStatementRunnable {
    const paren = seq(tok(ParenLeftW), Source, tok(WParenRightW));

    const at = ver(Version.v740sp05, seq(tok(WAt), alt(SimpleSource3, paren)));

    return alt(SimpleSource3, at);
  }
}