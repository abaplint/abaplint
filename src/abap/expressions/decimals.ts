import {seq, str, Expression, IStatementRunnable} from "../combi";
import {Integer} from "./";

export class Decimals extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seq(str("DECIMALS"), new Integer());
    return ret;
  }
}