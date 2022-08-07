import {alt, seq, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {ComponentName} from "./component_name";
import {ComponentCompare} from "./component_compare";

export class LoopGroupByComponent extends Expression {
  public getRunnable(): IStatementRunnable {
    const groupSize = seq(ComponentName, "=", "GROUP SIZE");
    const components = alt(ComponentCompare, groupSize);
    return components;
  }
}