import {Expression, regex} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSString extends Expression {
  public getRunnable(): IStatementRunnable {
    // https://stackoverflow.com/a/57754227
    return regex(/^'[A-Za-zÀ-ž\u0370-\u03FF\u0400-\u04FF: -_]*'$/);
  }
}