import {seq, starPrio, Expression, optPrio, altPrio} from "../combi";
import {ComponentName, ArrowOrDash, FieldOffset, FieldLength, Dereference} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ComponentChainSimple extends Expression {
  public getRunnable(): IStatementRunnable {

    const chain = starPrio(altPrio(
      Dereference,
      seq(ArrowOrDash, ComponentName)));

    const ret = seq(ComponentName, chain, optPrio(FieldOffset), optPrio(FieldLength));

    return ret;
  }
}