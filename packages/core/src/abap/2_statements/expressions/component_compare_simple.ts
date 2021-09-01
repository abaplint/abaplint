import {seq, plus, altPrio, Expression} from "../combi";
import {Dynamic, Source} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {ComponentChainSimple} from "./component_chain_simple";

export class ComponentCompareSimple extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seq(altPrio(ComponentChainSimple, Dynamic), "=", Source);
    return plus(ret);
  }
}