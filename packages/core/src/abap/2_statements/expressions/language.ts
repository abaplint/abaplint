import {seq, Expression, altPrio} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class Language extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("LANGUAGE", altPrio("SQLSCRIPT", "SQL", "GRAPH"));
  }
}