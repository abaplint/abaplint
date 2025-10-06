import {CDSSource} from ".";
import {altPrio, Expression, optPrio, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSCondition} from "./cds_condition";

export class CDSJoin extends Expression {
  public getRunnable(): IStatementRunnable {
    const cond = seq(CDSSource, "ON", CDSCondition);
    const foo = altPrio(seq("(", cond, ")"), cond);
    return seq(optPrio(altPrio("LEFT OUTER TO ONE", "LEFT OUTER", "INNER", "CROSS", "RIGHT OUTER")), "JOIN", altPrio(foo, CDSSource));
  }
}