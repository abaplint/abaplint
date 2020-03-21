import {str, alt, tok, seq, Expression, ver} from "../combi";
import {Version} from "../../../version";
import {TypeNameOrInfer, Source} from ".";
import {ParenLeftW, WParenRightW, WParenRight} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

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