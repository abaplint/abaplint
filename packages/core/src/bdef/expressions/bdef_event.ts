import {BDEFName, BDEFParameter, BDEFString} from ".";
import {altPrio, Expression, optPrio, seq, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

/** eg. "event TravelCreated parameter ZD_TRAVEL_EVENT;" or "event StatusUpdated for side effects;" */
export class BDEFEvent extends Expression {
  public getRunnable(): IStatementRunnable {
    const tail = altPrio(
      seq("ON", BDEFName),
      BDEFParameter,
      "FOR SIDE EFFECTS",
      seq("DESCRIPTION", BDEFString),
      seq("CATEGORY", BDEFName));

    return seq(optPrio("MANAGED"), "EVENT", BDEFName, starPrio(tail), ";");
  }
}
