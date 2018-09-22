import {seq, alt, tok, Reuse, IRunnable} from "../combi";
import {WParenLeft, ParenLeft, ParenRightW, ParenRight} from "../tokens/";
import {FieldChain, Constant} from "./";

export class Dynamic extends Reuse {
  public get_runnable(): IRunnable {
    let ret = seq(alt(tok(WParenLeft), tok(ParenLeft)),
                  alt(new FieldChain(), new Constant()),
                  alt(tok(ParenRightW), tok(ParenRight)));

    return ret;
  }
}