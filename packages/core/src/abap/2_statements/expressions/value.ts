import {seq, alts, Expression} from "../combi";
import {SimpleFieldChain, Constant} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Value extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seq("VALUE", alts(Constant, SimpleFieldChain, "IS INITIAL"));
    return ret;
  }
}