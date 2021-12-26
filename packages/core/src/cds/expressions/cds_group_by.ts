import {CDSName} from ".";
import {Expression, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSGroupBy extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = seq(CDSName, star(seq(".", CDSName)));
    return seq("GROUP BY", name, star(seq(",", name)));
  }
}