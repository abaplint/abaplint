import {seq, str, alt, Expression, IRunnable} from "../combi";
import {Source} from "./";

export class Value extends Expression {
  public getRunnable(): IRunnable {
    let ret = seq(str("VALUE"), alt(new Source(), str("IS INITIAL")));
    return ret;
  }
}