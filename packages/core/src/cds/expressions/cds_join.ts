import {CDSName, CDSSource} from ".";
import {Expression, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSJoin extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = seq(CDSName, ".", CDSName);
    return seq("INNER JOIN", CDSSource, "ON", name, "=", name);
  }
}