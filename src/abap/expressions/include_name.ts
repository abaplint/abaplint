import {seq, opt, tok, regex as reg, Reuse, IRunnable} from "../combi";
import {Dash} from "../tokens/";

export class IncludeName extends Reuse {
  public get_runnable(): IRunnable {
    return seq(reg(/^<?(\/\w+\/)?\w+(~\w+)?>?$/), opt(seq(tok(Dash), reg(/^\w+$/))));
  }
}