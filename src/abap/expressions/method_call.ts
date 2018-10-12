import {seq, alt, tok, Expression, IRunnable} from "../combi";
import {ParenLeftW, WParenRight, WParenRightW} from "../tokens/";
import {Source, MethodName, ParameterListS, MethodParameters} from "./";

export class MethodCall extends Expression {
  public getRunnable(): IRunnable {
    let white = seq(tok(ParenLeftW), alt(new Source(), new ParameterListS(), new MethodParameters()));

    let ret = seq(new MethodName(),
                  white,
                  alt(tok(WParenRight), tok(WParenRightW)));

    return ret;
  }
}