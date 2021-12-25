import {CDSName} from ".";
import {Expression, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSAs extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("AS", CDSName);
  }
}