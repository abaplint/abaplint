import {seq, alt, tok, str, Reuse, IRunnable} from "../combi";
import {ParenLeftW, ParenLeft} from "../tokens/";
import {Source, MethodName, ParameterListS, MethodParameters, ConstantString} from "./";

export class MethodCall extends Reuse {
  public get_runnable(): IRunnable {
    let white = seq(tok(ParenLeftW), alt(new Source(), new ParameterListS(), new MethodParameters()));
    let noWhite = seq(tok(ParenLeft), new ConstantString());

    let ret = seq(new MethodName(),
                  alt(white, noWhite),
                  str(")"));

    return ret;
  }
}