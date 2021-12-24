import {CDSName} from ".";
import {Expression, optPrio, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSElement extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(optPrio("KEY"), CDSName, optPrio(seq("AS", CDSName)));
  }
}