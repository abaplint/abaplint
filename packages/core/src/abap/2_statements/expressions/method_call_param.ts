import {seq, alt, tok, Expression} from "../combi";
import {ParenLeftW, WParenRight, WParenRightW} from "../../1_lexer/tokens";
import {Source, ParameterListS, MethodParameters} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class MethodCallParam extends Expression {
  public getRunnable(): IStatementRunnable {
    const param = alt(new Source(), new ParameterListS(), new MethodParameters());
    const ret = seq(tok(ParenLeftW), param, alt(tok(WParenRight), tok(WParenRightW)));
    return ret;
  }
}