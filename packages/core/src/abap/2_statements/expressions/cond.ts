import {seqs, altPrios, str, starPrio, Expression, ver} from "../combi";
import {Compare} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {CondSub} from "./cond_sub";
import {Version} from "../../../version";

export class Cond extends Expression {
  public getRunnable(): IStatementRunnable {
    const operator = altPrios("AND", "OR", ver(Version.v702, str("EQUIV")));
    const cnd = altPrios(Compare, CondSub);
    const ret = seqs(cnd, starPrio(seqs(operator, cnd)));
    return ret;
  }
}