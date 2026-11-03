import {BDEFCardinality, BDEFName} from ".";
import {Expression, optPrio, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

/** eg. "result [1] $self", "deep result ZD_RESULT" or "result selective [0..*] entity ZI_Travel" */
export class BDEFResult extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(
      optPrio("DEEP"),
      "RESULT",
      optPrio("SELECTIVE"),
      optPrio(BDEFCardinality),
      optPrio("ENTITY"),
      BDEFName);
  }
}
