import {seq, opt, tok, regex as reg, Reuse, IRunnable} from "../combi";
import {WDash} from "../tokens/";

export class Integer extends Reuse {
  public get_runnable(): IRunnable {
    return seq(opt(tok(WDash)), reg(/^\d+$/));
  }
}