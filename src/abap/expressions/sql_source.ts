import {alt, seq, ver, tok, Expression, IStatementRunnable, altPrio} from "../combi";
import {Version} from "../../version";
import {WAt, ParenLeftW, WParenRightW} from "../tokens/";
import {SQLAliasField, Source} from ".";

export class SQLSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const paren = seq(tok(ParenLeftW), new Source(), tok(WParenRightW));

// todo, this Source must be a simple field?
    const at = ver(Version.v740sp05, seq(tok(WAt), alt(new Source(), paren)));

    return altPrio(new SQLAliasField(), new Source(), at);
  }
}