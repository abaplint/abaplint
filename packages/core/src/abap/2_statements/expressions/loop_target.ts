import {seq, alt, opt, optPrio, Expression} from "../combi";
import {FSTarget, Target} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class LoopTarget extends Expression {

  public getRunnable(): IStatementRunnable {

    const into = seq(opt("REFERENCE"), "INTO", Target);

    const assigning = seq("ASSIGNING", FSTarget);

    const target = alt(seq(alt(into, assigning),
                           optPrio("CASTING")),
                       "TRANSPORTING NO FIELDS");

    return target;
  }

}