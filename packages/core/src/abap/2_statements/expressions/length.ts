import {seq, alts, Expression} from "../combi";
import {Integer, SimpleFieldChain, ConstantString} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Length extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seq("LENGTH", alts(Integer, ConstantString, SimpleFieldChain));
    return ret;
  }
}