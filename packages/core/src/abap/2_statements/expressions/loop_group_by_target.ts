import {opt, alt, seq, Expression, optPrio} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Target} from "./target";
import {FSTarget} from "./fstarget";

export class LoopGroupByTarget extends Expression {
  public getRunnable(): IStatementRunnable {
    const into = seq(opt("REFERENCE"), "INTO", Target);
    const assigning = seq("ASSIGNING", FSTarget);
    return optPrio(alt(into, assigning));
  }
}