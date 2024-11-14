import {seq, opt, Expression, tok, alt, altPrio} from "../combi";
import {ClassName, MessageSource, ParameterListS, RaiseWith, Source} from ".";
import {ParenLeft, ParenLeftW, ParenRightW, WParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class Throw extends Expression {
  public getRunnable(): IStatementRunnable {
    const message = seq("MESSAGE",
                        MessageSource,
                        opt(RaiseWith));

    return seq("THROW",
               opt("RESUMABLE"),
               ClassName,
               altPrio(tok(ParenLeftW), tok(ParenLeft)),
               opt(alt(Source, ParameterListS, message)),
               altPrio(tok(WParenRightW), tok(ParenRightW)));
  }
}