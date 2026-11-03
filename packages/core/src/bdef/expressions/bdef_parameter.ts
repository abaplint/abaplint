import {BDEFName} from ".";
import {Expression, optPrio, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

/** eg. "deep parameter ZD_PARAMETER" */
export class BDEFParameter extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(optPrio("DEEP"), "PARAMETER", BDEFName);
  }
}
