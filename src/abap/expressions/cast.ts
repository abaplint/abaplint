import {str, alt, tok, seq, Expression, IStatementRunnable, ver} from "../combi";
import {Version} from "../../version";
import {TypeNameOrInfer, Source} from ".";
import {ParenLeftW, WParenRightW, WParenRight} from "../tokens";

export class Cast extends Expression {
  public getRunnable(): IStatementRunnable {
    const rparen = alt(tok(WParenRightW), tok(WParenRight));

    const cast = ver(Version.v740sp02, seq(str("CAST"),
                                           new TypeNameOrInfer(),
                                           tok(ParenLeftW),
                                           new Source(),
                                           rparen));

    return cast;
  }
}