import {seq, ver, tok, Expression, alt, altPrio} from "../combi";
import {Version} from "../../../version";
import {ParenLeftW, WParenRightW, At} from "../../1_lexer/tokens";
import {SQLAliasField, Source, SimpleSource3} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLSourceNoSpace extends Expression {
  public getRunnable(): IStatementRunnable {
    const paren = seq(tok(ParenLeftW), Source, tok(WParenRightW));

    const at = ver(Version.v740sp05, seq(tok(At), altPrio(SimpleSource3, paren)));

    return alt(SQLAliasField, SimpleSource3, at);
  }
}