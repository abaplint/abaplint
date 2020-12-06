import {seqs, pluss, Expression} from "../combi";
import {FormParam} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FormTables extends Expression {
  public getRunnable(): IStatementRunnable {
    return seqs("TABLES", pluss(FormParam));
  }
}