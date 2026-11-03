import {BDEFAssociationBody, BDEFDefaultFunction, BDEFName, BDEFOptions, BDEFParameter, BDEFResult, BDEFString} from ".";
import {altPrio, Expression, optPrio, seq, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

/** reuse in projections and interfaces, eg. "use action acceptTravel as accept;" */
export class BDEFUse extends Expression {
  public getRunnable(): IStatementRunnable {
    const end = altPrio(";", BDEFDefaultFunction);

    const operation = seq(altPrio("CREATE", "UPDATE", "DELETE"), optPrio(BDEFOptions), end);

    const actionTail = altPrio(
      seq("AS", BDEFName),
      seq("EXTERNAL", BDEFString),
      BDEFParameter,
      BDEFResult);
    const action = seq(altPrio("ACTION", "FUNCTION"), optPrio(BDEFOptions), BDEFName, starPrio(actionTail), end);

    const association = seq(
      "ASSOCIATION",
      optPrio(BDEFOptions),
      BDEFName,
      optPrio(seq("ABBREVIATION", BDEFName)),
      altPrio(";", BDEFAssociationBody));

    return seq("USE", altPrio(
      operation,
      action,
      association,
      seq("ETAG", ";"),
      seq("SIDE EFFECTS", ";"),
      seq("KEY", BDEFName, ";"),
      seq("EVENT", BDEFName, optPrio(BDEFParameter), ";")));
  }
}
