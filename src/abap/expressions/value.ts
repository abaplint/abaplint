import {seq, str, alt, Expression, IStatementRunnable} from "../combi";
import {Constant} from "./";
import {SimpleFieldChain} from "./";

export class Value extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seq(str("VALUE"), alt(new Constant(), new SimpleFieldChain(), str("IS INITIAL")));
    return ret;
  }
}