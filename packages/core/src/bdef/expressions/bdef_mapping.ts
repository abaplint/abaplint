import {BDEFName} from ".";
import {altPrio, Expression, optPrio, seq, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

/** eg. "mapping for ztravel corresponding { TravelID = travel_id; }" */
export class BDEFMapping extends Expression {
  public getRunnable(): IStatementRunnable {
    const names = seq(BDEFName, starPrio(seq(",", BDEFName)));
    const line = seq(BDEFName, "=", BDEFName, optPrio(seq("CONTROL", BDEFName)), ";");
    // deep mapping of a sub node, eg. "sub _Items = items;"
    const sub = seq("SUB", BDEFName, "=", BDEFName, ";");
    const body = seq("{", starPrio(altPrio(sub, line, ";")), "}");

    const option = altPrio(
      "CORRESPONDING",
      "EXTENSIBLE",
      seq("EXCEPT", names),
      seq("CONTROL", BDEFName));

    return seq(
      optPrio("DEEP"),
      "MAPPING FOR",
      BDEFName,
      starPrio(option),
      altPrio(";", body));
  }
}
