import {seq, str, alt, Expression, IRunnable} from "../combi";
import {Source} from "./";

export class Value extends Expression {
  public get_runnable(): IRunnable {
    let ret = seq(str("VALUE"), alt(new Source(), str("IS INITIAL")));
    return ret;
  }
}