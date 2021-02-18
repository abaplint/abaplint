import {seq, alt, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class Language extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("LANGUAGE", alt("SQLSCRIPT", "SQL", "GRAPH"));
  }
}