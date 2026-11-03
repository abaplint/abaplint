import {BDEFFieldPath, BDEFName, BDEFOptions} from ".";
import {altPrio, Expression, optPrio, seq, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

/** determinations and validations, eg. "validation validateDates on save { create; field BeginDate, EndDate; }" */
export class BDEFDetermination extends Expression {
  public getRunnable(): IStatementRunnable {
    const fields = seq(BDEFFieldPath, starPrio(seq(",", BDEFFieldPath)));
    const trigger = altPrio(
      seq(altPrio("CREATE", "UPDATE", "DELETE"), ";"),
      seq("FIELD", fields, ";"),
      seq("ENTITY", fields, ";"),
      ";");

    return seq(
      altPrio("DETERMINATION", "VALIDATION"),
      optPrio(BDEFOptions),
      BDEFName,
      "ON",
      altPrio("MODIFY", "SAVE"),
      "{", starPrio(trigger), "}");
  }
}
