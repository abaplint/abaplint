import {seq, str, Expression, IRunnable} from "../combi";
import {Integer} from "./";

export class Decimals extends Expression {
  public getRunnable(): IRunnable {
    const ret = seq(str("DECIMALS"), new Integer());
    return ret;
  }
}