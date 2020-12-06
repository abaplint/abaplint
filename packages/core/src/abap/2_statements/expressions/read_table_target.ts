import {Expression, altPrios, seqs, optPrios} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {FSTarget} from "./fstarget";
import {Target} from "./target";

export class ReadTableTarget extends Expression {
  public getRunnable(): IStatementRunnable {

    const target = altPrios(seqs("ASSIGNING", FSTarget),
                            seqs(optPrios("REFERENCE"), "INTO", Target),
                            "TRANSPORTING NO FIELDS");

    return target;
  }
}