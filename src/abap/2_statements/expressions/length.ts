import {seq, alt, str, Expression, IStatementRunnable} from "../combi";
import {Integer, SimpleFieldChain, ConstantString} from ".";

export class Length extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seq(str("LENGTH"), alt(new Integer(), new ConstantString(), new SimpleFieldChain()));
    return ret;
  }
}