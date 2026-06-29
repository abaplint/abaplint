import {seq, altPrio, Expression, regex as reg} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {DatabaseTable} from "./database_table";

export class SQLProvidedBy extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("PROVIDED BY", altPrio(new DatabaseTable(true), reg(/^[\w\/]+$/)));
  }
}
