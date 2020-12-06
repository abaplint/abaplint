import {alt, tok, seq, Expression, ver, opt, plus} from "../combi";
import {Version} from "../../../version";
import {TypeNameOrInfer, Source, ParameterListS} from ".";
import {ParenLeftW, WParenLeftW, WParenRightW, WParenRight} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class NewObject extends Expression {
  public getRunnable(): IStatementRunnable {
    const lines = plus(seq(tok(WParenLeftW), Source, tok(WParenRightW)));

    const rparen = alt(tok(WParenRightW), tok(WParenRight));

    const neww = seq("NEW",
                     TypeNameOrInfer,
                     tok(ParenLeftW),
                     opt(alt(Source, ParameterListS, lines)),
                     rparen);

    return ver(Version.v740sp02, neww);
  }
}