import {seq, opt, Expression, tok, alt, altPrio} from "../combi";
import {ClassName, ParameterListS, Source} from ".";
import {ParenLeft, ParenLeftW, ParenRightW, WParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class Throw extends Expression {
  public getRunnable(): IStatementRunnable {
// todo, MESSAGE
    return seq("THROW",
               opt("RESUMABLE"),
               ClassName,
               altPrio(tok(ParenLeftW), tok(ParenLeft)),
               opt(alt(Source, ParameterListS)),
               altPrio(tok(WParenRightW), tok(ParenRightW)));
  }
}