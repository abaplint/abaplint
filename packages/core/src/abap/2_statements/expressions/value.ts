import {seq, alt, Expression} from "../combi";
import {SimpleFieldChain, Constant} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Value extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seq("VALUE", alt(Constant, SimpleFieldChain, "IS INITIAL"));
    return ret;
  }
}