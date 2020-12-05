import {seqs, altPrio, str, starPrio, Expression, ver} from "../combi";
import {Compare} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {CondSub} from "./cond_sub";
import {Version} from "../../../version";

export class Cond extends Expression {
  public getRunnable(): IStatementRunnable {
    const operator = altPrio(str("AND"), str("OR"), ver(Version.v702, str("EQUIV")));
    const cnd = altPrio(new Compare(), new CondSub());
    const ret = seqs(cnd, starPrio(seqs(operator, cnd)));
    return ret;
  }
}