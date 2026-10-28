import {BDEFAssociationBody, BDEFName, BDEFOptions} from ".";
import {altPrio, Expression, optPrio, regex, seq, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

/** eg. "association _Booking { create; with draft; }" */
export class BDEFAssociation extends Expression {
  public getRunnable(): IStatementRunnable {
    // cross BO association, eg. "using /DMO/R_TRAVELTP_XBO \_Agency"
    const using = seq("USING", BDEFName, optPrio(regex(/^\\\w+$/)));

    return seq(
      starPrio(altPrio("INTERNAL", "UNMANAGED", "ANCESTOR")),
      "ASSOCIATION",
      optPrio(BDEFOptions),
      BDEFName,
      optPrio(using),
      optPrio(seq("ABBREVIATION", BDEFName)),
      optPrio("WITH HIERARCHY"),
      altPrio(";", BDEFAssociationBody));
  }
}
