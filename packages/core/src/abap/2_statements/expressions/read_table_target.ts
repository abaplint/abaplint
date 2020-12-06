import {Expression, altPrio, seq, optPrio} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {FSTarget} from "./fstarget";
import {Target} from "./target";

export class ReadTableTarget extends Expression {
  public getRunnable(): IStatementRunnable {

    const target = altPrio(seq("ASSIGNING", FSTarget),
                           seq(optPrio("REFERENCE"), "INTO", Target),
                           "TRANSPORTING NO FIELDS");

    return target;
  }
}