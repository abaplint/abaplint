import {alts, seq, vers, tok, Expression, altPrios} from "../combi";
import {Version} from "../../../version";
import {WAt, ParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {SQLAliasField, Source} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const paren = seq(tok(ParenLeftW), Source, tok(WParenRightW));

// todo, this Source must be a simple field?
    const at = vers(Version.v740sp05, seq(tok(WAt), alts(Source, paren)));

    return altPrios(SQLAliasField, Source, at);
  }
}