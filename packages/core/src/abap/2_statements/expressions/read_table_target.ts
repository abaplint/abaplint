import {str, Expression, altPrio, seqs, optPrio} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {FSTarget} from "./fstarget";
import {Target} from "./target";

export class ReadTableTarget extends Expression {
  public getRunnable(): IStatementRunnable {

    const target = altPrio(seqs("ASSIGNING", FSTarget),
                           seqs(optPrio(str("REFERENCE")), "INTO", Target),
                           str("TRANSPORTING NO FIELDS"));

    return target;
  }
}