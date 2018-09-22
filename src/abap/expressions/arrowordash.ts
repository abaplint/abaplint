import {alt, tok, Reuse, IRunnable} from "../combi";
import {Arrow, Dash} from "../tokens/";

export class ArrowOrDash extends Reuse {
  public get_runnable(): IRunnable {
    return alt(tok(Arrow), tok(Dash));
  }
}