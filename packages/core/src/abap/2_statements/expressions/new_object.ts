import {str, alt, tok, seq, Expression, ver, opt, plus} from "../combi";
import {Version} from "../../../version";
import {TypeNameOrInfer, Source, ParameterListS} from ".";
import {ParenLeftW, WParenLeftW, WParenRightW, WParenRight} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class NewObject extends Expression {
  public getRunnable(): IStatementRunnable {
    const lines = plus(seq(tok(WParenLeftW), new Source(), tok(WParenRightW)));

    const rparen = alt(tok(WParenRightW), tok(WParenRight));

    const neww = ver(Version.v740sp02, seq(str("NEW"),
                                           new TypeNameOrInfer(),
                                           tok(ParenLeftW),
                                           opt(alt(new Source(), new ParameterListS(), lines)),
                                           rparen));

    return neww;
  }
}