import {seq, star, Expression, IStatementRunnable} from "../combi";
import {ComponentName, ArrowOrDash} from ".";

export class ComponentChainSimple extends Expression {
  public getRunnable(): IStatementRunnable {

    const chain = seq(new ComponentName(),
                      star(seq(new ArrowOrDash(), new ComponentName())));

//    const ret = seq(chain, optPrio(new FieldOffset()), optPrio(new FieldLength()));

    return chain;
  }
}