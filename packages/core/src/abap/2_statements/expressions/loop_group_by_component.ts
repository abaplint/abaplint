import {alt, seq, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {ComponentName} from "./component_name";
import {ComponentCompareSingle} from "./component_compare_single";

export class LoopGroupByComponent extends Expression {
  public getRunnable(): IStatementRunnable {
    const groupSize = seq(ComponentName, "=", "GROUP SIZE");
    const groupIndex = seq(ComponentName, "=", "GROUP INDEX");
    const components = alt(ComponentCompareSingle, groupSize, groupIndex);
    return components;
  }
}