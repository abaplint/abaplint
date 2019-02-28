import {seq, str, opt, Expression, IStatementRunnable, tok} from "../combi";
import {ClassName, ParameterListS} from "./";
import {ParenLeftW, WParenRightW} from "../tokens";

export class Throw extends Expression {
  public getRunnable(): IStatementRunnable {
// todo, MESSAGE
    return seq(str("THROW"),
               opt(str("RESUMABLE")),
               new ClassName(),
               tok(ParenLeftW),
               opt(new ParameterListS()),
               tok(WParenRightW));
  }
}