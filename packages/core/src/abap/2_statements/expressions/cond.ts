import {seqs, altPrios, starPrios, Expression, vers} from "../combi";
import {Compare} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {CondSub} from "./cond_sub";
import {Version} from "../../../version";

export class Cond extends Expression {
  public getRunnable(): IStatementRunnable {
    const operator = altPrios("AND", "OR", vers(Version.v702, "EQUIV"));
    const cnd = altPrios(Compare, CondSub);
    const ret = seqs(cnd, starPrios(seqs(operator, cnd)));
    return ret;
  }
}