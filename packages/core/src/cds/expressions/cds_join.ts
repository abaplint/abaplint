import {CDSSource} from ".";
import {altPrio, Expression, opt, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSCondition} from "./cds_condition";

export class CDSJoin extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(opt(altPrio("LEFT OUTER TO ONE", "LEFT OUTER", "INNER")), "JOIN", CDSSource, "ON", CDSCondition);
  }
}