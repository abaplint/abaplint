import {seq, starPrio, Expression, optPrio} from "../combi";
import {ComponentName, ArrowOrDash, FieldOffset, FieldLength} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ComponentChainSimple extends Expression {
  public getRunnable(): IStatementRunnable {

    const chain = seq(ComponentName,
                      starPrio(seq(ArrowOrDash, ComponentName)));

    const ret = seq(chain, optPrio(FieldOffset), optPrio(FieldLength));

    return ret;
  }
}