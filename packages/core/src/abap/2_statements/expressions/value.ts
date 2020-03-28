import {seq, str, alt, Expression} from "../combi";
import {SimpleFieldChain, Constant} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Value extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seq(str("VALUE"), alt(new Constant(), new SimpleFieldChain(), str("IS INITIAL")));
    return ret;
  }
}