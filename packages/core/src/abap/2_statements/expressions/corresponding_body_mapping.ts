import {seq, Expression, plus} from "../combi";
import {ComponentChain, ComponentName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class CorrespondingBodyMapping extends Expression {
  public getRunnable(): IStatementRunnable {
    const mapping = seq("MAPPING", plus(seq(ComponentName, "=", ComponentChain)));
    return mapping;
  }
}