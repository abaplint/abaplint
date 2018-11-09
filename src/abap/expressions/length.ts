import {seq, str, Expression, IRunnable} from "../combi";
import {Source} from "./";

export class Length extends Expression {
  public getRunnable(): IRunnable {
    let ret = seq(str("LENGTH"), new Source());
    return ret;
  }
}