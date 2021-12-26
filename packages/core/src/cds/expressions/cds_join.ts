import {CDSSource} from ".";
import {alt, Expression, opt, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSCondition} from "./cds_condition";

export class CDSJoin extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(opt(alt("INNER", "LEFT OUTER")), "JOIN", CDSSource, "ON", CDSCondition);
  }
}