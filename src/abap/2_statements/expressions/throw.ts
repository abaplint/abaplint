import {seq, str, opt, Expression, IStatementRunnable, tok, alt} from "../combi";
import {ClassName, ParameterListS, Source} from ".";
import {ParenLeftW, WParenRightW} from "../../1_lexer/tokens";

export class Throw extends Expression {
  public getRunnable(): IStatementRunnable {
// todo, MESSAGE
    return seq(str("THROW"),
               opt(str("RESUMABLE")),
               new ClassName(),
               tok(ParenLeftW),
               opt(alt(new Source(), new ParameterListS())),
               tok(WParenRightW));
  }
}