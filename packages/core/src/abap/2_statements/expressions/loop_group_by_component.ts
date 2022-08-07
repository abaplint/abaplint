import {alt, seq, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {ComponentName} from "./component_name";
import {ComponentCompareSimple} from "./component_compare_simple";

export class LoopGroupByComponent extends Expression {
  public getRunnable(): IStatementRunnable {
    const groupSize = seq(ComponentName, "=", "GROUP SIZE");
    const components = alt(ComponentCompareSimple, groupSize);
    return components;
  }
}