import {seq, opt, Expression, tok, alt} from "../combi";
import {ClassName, ParameterListS, Source} from ".";
import {ParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class Throw extends Expression {
  public getRunnable(): IStatementRunnable {
// todo, MESSAGE
    return seq("THROW",
               opt("RESUMABLE"),
               ClassName,
               tok(ParenLeftW),
               opt(alt(Source, ParameterListS)),
               tok(WParenRightW));
  }
}