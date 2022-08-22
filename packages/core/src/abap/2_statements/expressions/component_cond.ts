import {seq, alt, star, Expression} from "../combi";
import {ComponentCompare, ComponentCondSub} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ComponentCond extends Expression {
  public getRunnable(): IStatementRunnable {
    const operator = alt("AND", "OR");

    const cnd = alt(ComponentCompare, ComponentCondSub);

    const ret = seq(cnd, star(seq(operator, cnd)));

    return ret;
  }
}