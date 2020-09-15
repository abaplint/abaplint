import {seq, alt, str, star, Expression, altPrio} from "../combi";
import {Compare} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {CondSub} from "./cond_sub";

export class Cond extends Expression {
  public getRunnable(): IStatementRunnable {
    const operator = altPrio(str("AND"), str("OR"), str("EQUIV"));
    const cnd = alt(new Compare(), new CondSub());
    const ret = seq(cnd, star(seq(operator, cnd)));
    return ret;
  }
}