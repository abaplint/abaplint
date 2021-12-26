import {CDSName, CDSSource} from ".";
import {Expression, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSJoin extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = seq(CDSName, ".", CDSName);
    const condition = seq(name, "=", name);
    return seq("INNER JOIN", CDSSource, "ON", condition, star(seq("AND", condition)));
  }
}