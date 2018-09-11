import {seq, str, alt, Reuse, IRunnable} from "../combi";
import {Source} from "./";

export class Value extends Reuse {
  public get_runnable(): IRunnable {
    let ret = seq(str("VALUE"), alt(new Source(), str("IS INITIAL")));
    return ret;
  }
}