import {Expression, str} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class DefineView extends Expression {
  public getRunnable(): IStatementRunnable {
    return str("DEFINE VIEW");
  }
}