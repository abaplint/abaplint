import {seq, altPrio, Expression} from "../combi";
import {Dynamic, Source} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {ComponentChainSimple} from "./component_chain_simple";

export class ComponentCompareSingle extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seq(altPrio(ComponentChainSimple, Dynamic), "=", Source);
    return ret;
  }
}