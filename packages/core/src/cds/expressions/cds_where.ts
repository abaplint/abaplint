import {CDSName} from ".";
import {Expression, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSWhere extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("WHERE", CDSName, "=", CDSName, star(seq(".", CDSName)));
  }
}