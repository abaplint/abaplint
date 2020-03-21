import {seq, alt, str, Expression} from "../combi";
import {Integer, SimpleFieldChain, ConstantString} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Length extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seq(str("LENGTH"), alt(new Integer(), new ConstantString(), new SimpleFieldChain()));
    return ret;
  }
}