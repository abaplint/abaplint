import {seq, pluss, Expression} from "../combi";
import {FormParam} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FormTables extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("TABLES", pluss(FormParam));
  }
}