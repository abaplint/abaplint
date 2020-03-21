import {seq, star, Expression, optPrio} from "../combi";
import {ComponentName, ArrowOrDash, FieldOffset, FieldLength} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ComponentChainSimple extends Expression {
  public getRunnable(): IStatementRunnable {

    const chain = seq(new ComponentName(),
                      star(seq(new ArrowOrDash(), new ComponentName())));

    const ret = seq(chain, optPrio(new FieldOffset()), optPrio(new FieldLength()));

    return ret;
  }
}