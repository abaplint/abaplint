import {seqs, star, Expression, optPrio} from "../combi";
import {ComponentName, ArrowOrDash, FieldOffset, FieldLength} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ComponentChainSimple extends Expression {
  public getRunnable(): IStatementRunnable {

    const chain = seqs(ComponentName,
                       star(seqs(ArrowOrDash, ComponentName)));

    const ret = seqs(chain, optPrio(new FieldOffset()), optPrio(new FieldLength()));

    return ret;
  }
}