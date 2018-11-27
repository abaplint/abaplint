import {alt, seq, ver, tok, Expression, IStatementRunnable} from "../combi";
import {Version} from "../../version";
import {WAt, ParenLeftW, WParenRight, WParenRightW} from "../tokens/";
import {Source} from "./source";

export class SQLSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const paren = seq(tok(ParenLeftW), new Source(), alt(tok(WParenRight), tok(WParenRightW)));

// todo, this Source must be a simple field?
    const at = ver(Version.v740sp05, seq(tok(WAt), alt(new Source(), paren)));

    return alt(new Source(), at);
  }
}