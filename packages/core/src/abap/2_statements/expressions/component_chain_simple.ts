import {seqs, star, Expression, optPrios} from "../combi";
import {ComponentName, ArrowOrDash, FieldOffset, FieldLength} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ComponentChainSimple extends Expression {
  public getRunnable(): IStatementRunnable {

    const chain = seqs(ComponentName,
                       star(seqs(ArrowOrDash, ComponentName)));

    const ret = seqs(chain, optPrios(FieldOffset), optPrios(FieldLength));

    return ret;
  }
}