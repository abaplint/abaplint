import {alt, seq, ver, tok, Expression, altPrio} from "../combi";
import {Version} from "../../../version";
import {WAt, ParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {SQLAliasField, Source} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const paren = seq(tok(ParenLeftW), Source, tok(WParenRightW));

// todo, this Source must be a simple field?
    const at = ver(Version.v740sp05, seq(tok(WAt), alt(Source, paren)));

    return altPrio(SQLAliasField, Source, at);
  }
}