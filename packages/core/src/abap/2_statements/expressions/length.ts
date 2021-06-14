import {seq, Expression, altPrio} from "../combi";
import {Integer, SimpleFieldChain, ConstantString} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Length extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seq("LENGTH", altPrio(Integer, ConstantString, SimpleFieldChain));
    return ret;
  }
}