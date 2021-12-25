import {CDSName} from ".";
import {Expression, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSJoin extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = seq(CDSName, ".", CDSName);
    return seq("INNER JOIN", CDSName, "ON", name, "=", name);
  }
}