import {Expression, altPrios, seq, optPrios} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {FSTarget} from "./fstarget";
import {Target} from "./target";

export class ReadTableTarget extends Expression {
  public getRunnable(): IStatementRunnable {

    const target = altPrios(seq("ASSIGNING", FSTarget),
                            seq(optPrios("REFERENCE"), "INTO", Target),
                            "TRANSPORTING NO FIELDS");

    return target;
  }
}