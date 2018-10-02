import {seq, alt, tok, Reuse, IRunnable} from "../combi";
import {ParenLeftW, WParenRight, WParenRightW} from "../tokens/";
import {Source, MethodName, ParameterListS, MethodParameters} from "./";

export class MethodCall extends Reuse {
  public get_runnable(): IRunnable {
    let white = seq(tok(ParenLeftW), alt(new Source(), new ParameterListS(), new MethodParameters()));

    let ret = seq(new MethodName(),
                  white,
                  alt(tok(WParenRight), tok(WParenRightW)));

    return ret;
  }
}