import {CDSName} from ".";
import {Expression, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSWithParameters extends Expression {
  public getRunnable(): IStatementRunnable {
    const param = seq(CDSName, ":", CDSName);
    return seq("wITH PARAMETERS", param, star(seq(",", param)));
  }
}