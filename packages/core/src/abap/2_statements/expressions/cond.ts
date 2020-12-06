import {seq, altPrio, starPrio, Expression, ver} from "../combi";
import {Compare} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {CondSub} from "./cond_sub";
import {Version} from "../../../version";

export class Cond extends Expression {
  public getRunnable(): IStatementRunnable {
    const operator = altPrio("AND", "OR", ver(Version.v702, "EQUIV"));
    const cnd = altPrio(Compare, CondSub);
    const ret = seq(cnd, starPrio(seq(operator, cnd)));
    return ret;
  }
}