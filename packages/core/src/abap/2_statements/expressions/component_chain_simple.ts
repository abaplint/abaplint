import {seq, stars, Expression, optPrios} from "../combi";
import {ComponentName, ArrowOrDash, FieldOffset, FieldLength} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ComponentChainSimple extends Expression {
  public getRunnable(): IStatementRunnable {

    const chain = seq(ComponentName,
                      stars(seq(ArrowOrDash, ComponentName)));

    const ret = seq(chain, optPrios(FieldOffset), optPrios(FieldLength));

    return ret;
  }
}