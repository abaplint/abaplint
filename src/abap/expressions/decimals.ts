import {seq, str, Expression, IRunnable} from "../combi";
import {Integer} from "./";

export class Decimals extends Expression {
  public getRunnable(): IRunnable {
    let ret = seq(str("DECIMALS"), new Integer());
    return ret;
  }
}