import {seq, alt, tok, Expression} from "../combi";
import {ParenLeftW, WParenRight, WParenRightW} from "../../1_lexer/tokens";
import {Source, MethodName, ParameterListS, MethodParameters} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class MethodCall extends Expression {
  public getRunnable(): IStatementRunnable {
    const white = seq(tok(ParenLeftW), alt(new Source(), new ParameterListS(), new MethodParameters()));

    const ret = seq(new MethodName(),
                    white,
                    alt(tok(WParenRight), tok(WParenRightW)));

    return ret;
  }
}