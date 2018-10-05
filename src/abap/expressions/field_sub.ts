import {seq, star, tok, regex as reg, Reuse, IRunnable} from "../combi";
import {Dash} from "../tokens/";

export class FieldSub extends Reuse {
  public get_runnable(): IRunnable {
    let ret = seq(reg(/^(\/\w+\/)?[\w%\$]+$/),
                  star(seq(tok(Dash), reg(/^\w+$/))));

    return ret;
  }
}