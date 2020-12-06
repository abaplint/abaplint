import {seq, opts, Expression, tok, alt} from "../combi";
import {ClassName, ParameterListS, Source} from ".";
import {ParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class Throw extends Expression {
  public getRunnable(): IStatementRunnable {
// todo, MESSAGE
    return seq("THROW",
               opts("RESUMABLE"),
               ClassName,
               tok(ParenLeftW),
               opts(alt(Source, ParameterListS)),
               tok(WParenRightW));
  }
}