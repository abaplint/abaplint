import {seq, star, Expression, IStatementRunnable, optPrio} from "../combi";
import {ComponentName, ArrowOrDash, FieldOffset, FieldLength} from ".";

export class ComponentChainSimple extends Expression {
  public getRunnable(): IStatementRunnable {

    const chain = seq(new ComponentName(),
                      star(seq(new ArrowOrDash(), new ComponentName())));

    const ret = seq(chain, optPrio(new FieldOffset()), optPrio(new FieldLength()));

    return ret;
  }
}