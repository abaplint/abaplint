import {BDEFName, BDEFOptions, BDEFReference} from ".";
import {altPrio, Expression, optPrio, seq, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

/** eg. "draft determine action Prepare { validation validateDate; determination ( always ) Child ~ setStatus; }" */
export class BDEFDetermineAction extends Expression {
  public getRunnable(): IStatementRunnable {
    const item = seq(altPrio("VALIDATION", "DETERMINATION"), optPrio(BDEFOptions), BDEFReference, ";");
    const body = seq("{", starPrio(item), "}");

    return seq(
      optPrio("EXTEND"),
      optPrio("DRAFT"),
      "DETERMINE ACTION",
      optPrio(BDEFOptions),
      BDEFName,
      optPrio("EXTENSIBLE"),
      altPrio(";", body));
  }
}
