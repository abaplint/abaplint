import {seq, str, plus, Expression} from "../combi";
import {FormParam} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FormTables extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(str("TABLES"), plus(new FormParam()));
  }
}