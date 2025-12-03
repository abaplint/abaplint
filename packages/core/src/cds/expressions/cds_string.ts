import {altPrio, Expression, regex, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSString extends Expression {
  public getRunnable(): IStatementRunnable {
    const abap = seq("abap", ".", regex(/^char'\w'$/));
    // https://stackoverflow.com/a/57754227
    const reg = regex(/^'([A-Za-zÀ-ž\u0370-\u03FF\u0400-\u04FF:\| -_]|'')*'$/);
    return altPrio(reg, abap);
  }
}