import {str, alt, tok, seq, Expression, ver, optPrio} from "../combi";
import {Version} from "../../../version";
import {TypeNameOrInfer, Source} from ".";
import {ParenLeftW, WParenRightW, WParenRight} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {Let} from "./let";

export class Cast extends Expression {
  public getRunnable(): IStatementRunnable {
    const rparen = alt(tok(WParenRightW), tok(WParenRight));

    const cast = ver(Version.v740sp02, seq(str("CAST"),
                                           new TypeNameOrInfer(),
                                           tok(ParenLeftW),
                                           optPrio(new Let()),
                                           new Source(),
                                           rparen));

    return cast;
  }
}