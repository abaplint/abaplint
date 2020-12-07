import {seq, altPrio, Expression} from "../combi";
import {Dynamic, Source, ComponentChain} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ComponentCompareSimple extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seq(altPrio(ComponentChain, Dynamic), "=", Source);

    return ret;
  }
}